import { Command } from 'nest-commander';

import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { type FlatSearchFieldMetadata } from 'src/engine/metadata-modules/flat-search-field-metadata/types/flat-search-field-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { getTargetSearchFieldMetadatasForTsVectorField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/get-target-search-field-metadatas-for-ts-vector-field.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.linkedRecordCachedName.universalIdentifier;
const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.searchVector.universalIdentifier;

@RegisteredWorkspaceCommand('2.35.0', 1787749300000)
@Command({
  name: 'upgrade:2-35:backfill-timeline-activity-search-field-metadata',
  description:
    'Converge the timelineActivity search field metadata to the standard declaration (linkedRecordCachedName), restoring the searchVector field when it is missing and dropping the rows that still index another field, then rebuild the generated column. Repairs workspaces whose search vector was derived from the legacy name field. Idempotent.',
})
export class BackfillTimelineActivitySearchFieldMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatSearchFieldMetadataMaps',
    ]);

    const timelineActivityFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (!isDefined(timelineActivityFlatObjectMetadata)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const linkedRecordCachedNameFlatFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(linkedRecordCachedNameFlatFieldMetadata)) {
      this.logger.log(
        `timelineActivity.linkedRecordCachedName does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const searchVectorFlatFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
      });

    // timelineActivity declares linkedRecordCachedName as its only search field, so the
    // search vector indexes at most this one row.
    const [indexedFlatSearchFieldMetadata] = isDefined(
      searchVectorFlatFieldMetadata,
    )
      ? getTargetSearchFieldMetadatasForTsVectorField({
          tsVectorFieldMetadataId: searchVectorFlatFieldMetadata.id,
          flatSearchFieldMetadataMaps,
        })
      : [];

    if (
      indexedFlatSearchFieldMetadata?.fieldMetadataUniversalIdentifier ===
      LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER
    ) {
      this.logger.log(
        `timelineActivity search vector already indexes linkedRecordCachedName for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Repointing the timelineActivity search vector to linkedRecordCachedName for workspace ${workspaceId}, currently indexing ${
        indexedFlatSearchFieldMetadata?.fieldMetadataUniversalIdentifier ??
        'nothing'
      }`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.applyConvergence({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatFieldMetadatasToCreate: isDefined(searchVectorFlatFieldMetadata)
        ? []
        : [
            this.getStandardSearchVectorFlatFieldMetadata({
              workspaceId,
              twentyStandardApplicationId: twentyStandardFlatApplication.id,
            }),
          ],
      flatSearchFieldMetadatasToCreate: [
        buildFlatSearchFieldMetadataForField({
          flatObjectMetadata: timelineActivityFlatObjectMetadata,
          flatFieldMetadata: linkedRecordCachedNameFlatFieldMetadata,
          tsVectorFlatFieldMetadata: {
            universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
          },
          position: 0,
        }),
      ],
      flatSearchFieldMetadatasToDelete: isDefined(
        indexedFlatSearchFieldMetadata,
      )
        ? [indexedFlatSearchFieldMetadata]
        : [],
    });

    await this.rebuildSearchVector({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
    });

    this.logger.log(
      `Converged the timelineActivity search vector for workspace ${workspaceId}`,
    );
  }

  private getStandardSearchVectorFlatFieldMetadata({
    workspaceId,
    twentyStandardApplicationId,
  }: {
    workspaceId: string;
    twentyStandardApplicationId: string;
  }): FlatFieldMetadata {
    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId,
      });

    const standardSearchVectorFlatFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: standardAllFlatEntityMaps.flatFieldMetadataMaps,
        universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(standardSearchVectorFlatFieldMetadata)) {
      throw new Error(
        'Standard application is missing timelineActivity.searchVector',
      );
    }

    return {
      ...standardSearchVectorFlatFieldMetadata,
      viewFieldIds: [],
      viewFieldUniversalIdentifiers: [],
    };
  }

  // Repointing a row is not expressible as an update: the engine treats a search field
  // metadata's indexed field as immutable (it is not part of its compared properties),
  // so the divergent rows are dropped and the standard one recreated in the same matrix.
  // Legacy path so the system searchVector field is restored exactly as declared,
  // without the record-page companions the side-effect engine injects for a new field.
  private async applyConvergence({
    workspaceId,
    applicationUniversalIdentifier,
    flatFieldMetadatasToCreate,
    flatSearchFieldMetadatasToCreate,
    flatSearchFieldMetadatasToDelete,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatFieldMetadatasToCreate: FlatFieldMetadata[];
    flatSearchFieldMetadatasToCreate: ReturnType<
      typeof buildFlatSearchFieldMetadataForField
    >[];
    flatSearchFieldMetadatasToDelete: FlatSearchFieldMetadata[];
  }): Promise<void> {
    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: flatFieldMetadatasToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            searchFieldMetadata: {
              flatEntityToCreate: flatSearchFieldMetadatasToCreate,
              flatEntityToDelete: flatSearchFieldMetadatasToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to converge the timelineActivity search field metadata for workspace ${workspaceId}:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }
  }

  // Search field metadata operations never touch the workspace schema, so the generated
  // column keeps the expression it was built with (the dropped name column, or nothing
  // at all once its cascade took the column down with it).
  private async rebuildSearchVector({
    workspaceId,
    applicationUniversalIdentifier,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
  }): Promise<void> {
    const actions: UniversalUpdateFieldAction[] = [
      {
        type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
        metadataName: 'fieldMetadata',
        universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
        update: {},
        rebuildSearchVector: true,
      },
    ];

    await this.workspaceMigrationRunnerService.run({
      workspaceMigration: {
        applicationUniversalIdentifier,
        actions,
      },
      workspaceId,
    });
  }
}
