import { Command } from 'nest-commander';

import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { buildFlatSearchFieldMetadataForField } from 'src/engine/metadata-modules/flat-search-field-metadata/utils/build-flat-search-field-metadata-for-field.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.linkedRecordCachedName.universalIdentifier;
const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.searchVector.universalIdentifier;

@RegisteredWorkspaceCommand('2.35.0', 1787749300000)
@Command({
  name: 'upgrade:2-35:backfill-timeline-activity-search-field-metadata',
  description:
    'Create the timelineActivity linkedRecordCachedName search field metadata row where it is missing, restoring the searchVector field itself when the workspace lost it. Workspaces upgraded from before the 2.33 search repoint never had this row, and dropping the legacy name field cascades away both their old row and the generated column. Idempotent.',
})
export class BackfillTimelineActivitySearchFieldMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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

    const standardFlatSearchFieldMetadata =
      flatSearchFieldMetadataMaps.byUniversalIdentifier[
        getSearchFieldUniversalIdentifier({
          applicationUniversalIdentifier:
            timelineActivityFlatObjectMetadata.applicationUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER,
        })
      ];

    if (
      isDefined(standardFlatSearchFieldMetadata) &&
      isDefined(searchVectorFlatFieldMetadata)
    ) {
      this.logger.log(
        `timelineActivity search vector already indexes linkedRecordCachedName for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Restoring the timelineActivity ${[
        ...(isDefined(standardFlatSearchFieldMetadata)
          ? []
          : ['search field metadata']),
        ...(isDefined(searchVectorFlatFieldMetadata)
          ? []
          : ['searchVector field']),
      ].join(' and ')} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            timelineActivityFlatObjectMetadata.applicationUniversalIdentifier,
          allFlatEntityOperationByMetadataName: {
            fieldMetadata: {
              flatEntityToCreate: isDefined(searchVectorFlatFieldMetadata)
                ? []
                : [
                    this.getStandardSearchVectorFlatFieldMetadata({
                      workspaceId,
                      twentyStandardApplicationId:
                        timelineActivityFlatObjectMetadata.applicationId,
                    }),
                  ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
            searchFieldMetadata: {
              flatEntityToCreate: isDefined(standardFlatSearchFieldMetadata)
                ? []
                : [
                    buildFlatSearchFieldMetadataForField({
                      flatObjectMetadata: timelineActivityFlatObjectMetadata,
                      flatFieldMetadata:
                        linkedRecordCachedNameFlatFieldMetadata,
                      tsVectorFlatFieldMetadata: {
                        universalIdentifier:
                          SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
                      },
                      position: 0,
                    }),
                  ],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to restore the timelineActivity search field metadata for workspace ${workspaceId}:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Restored the timelineActivity search vector for workspace ${workspaceId}`,
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
}
