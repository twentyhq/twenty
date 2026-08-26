import { Command } from 'nest-commander';

import { getSearchFieldUniversalIdentifier } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { type DataSource } from 'typeorm';

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
import { type UniversalUpdateFieldAction } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/builders/field/types/workspace-migration-field-action';
import { WORKSPACE_MIGRATION_ACTION_TYPE } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-builder/constants/workspace-migration-action-type.constant';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;
const LINKED_RECORD_CACHED_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.linkedRecordCachedName.universalIdentifier;
const SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.fields.searchVector.universalIdentifier;

@RegisteredWorkspaceCommand('2.35.0', 1787749300000)
@Command({
  name: 'upgrade:2-35:backfill-timeline-activity-search-field-metadata',
  description:
    'Create the timelineActivity linkedRecordCachedName search field metadata row where it is missing, restoring the searchVector field itself when the workspace lost it, and rebuild the physical searchVector column when it was dropped at the database level while the metadata survived. Workspaces upgraded from before the 2.33 search repoint never had this row, and dropping the legacy name field cascades away both their old row and the generated column. Idempotent.',
})
export class BackfillTimelineActivitySearchFieldMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
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

    if (!isDefined(dataSource)) {
      this.logger.error(
        `Cannot verify the timelineActivity searchVector column for workspace ${workspaceId}: no data source. Skipping, rerun once the workspace is reachable.`,
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

    // Without field metadata there is no column name to probe; the column is
    // gone with it and the create path recreates both.
    const searchVectorColumnExists = isDefined(searchVectorFlatFieldMetadata)
      ? await this.checkSearchVectorColumnExists({
          dataSource,
          workspaceId,
          timelineActivityFlatObjectMetadata,
          columnName: searchVectorFlatFieldMetadata.name,
        })
      : false;

    if (
      isDefined(standardFlatSearchFieldMetadata) &&
      isDefined(searchVectorFlatFieldMetadata) &&
      searchVectorColumnExists
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
        ...(searchVectorColumnExists ? [] : ['searchVector column']),
      ].join(' and ')} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    if (
      isDefined(standardFlatSearchFieldMetadata) &&
      isDefined(searchVectorFlatFieldMetadata)
    ) {
      // Metadata is already converged and only the physical column is missing.
      // The builder diffs metadata so it would produce no action here; dispatch
      // the rebuild directly to the update-field action handler instead, which
      // drops and recreates the generated column from the search field metadata.
      const rebuildSearchVectorAction: UniversalUpdateFieldAction = {
        type: WORKSPACE_MIGRATION_ACTION_TYPE.update,
        metadataName: 'fieldMetadata',
        universalIdentifier: SEARCH_VECTOR_FIELD_UNIVERSAL_IDENTIFIER,
        update: {},
        rebuildSearchVector: true,
      };

      await this.workspaceMigrationRunnerService.run({
        workspaceMigration: {
          applicationUniversalIdentifier:
            timelineActivityFlatObjectMetadata.applicationUniversalIdentifier,
          actions: [rebuildSearchVectorAction],
        },
        workspaceId,
      });

      this.logger.log(
        `Restored the timelineActivity search vector column for workspace ${workspaceId}`,
      );

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

  private async checkSearchVectorColumnExists({
    dataSource,
    workspaceId,
    timelineActivityFlatObjectMetadata,
    columnName,
  }: {
    dataSource: DataSource;
    workspaceId: string;
    timelineActivityFlatObjectMetadata: FlatObjectMetadata;
    columnName: string;
  }): Promise<boolean> {
    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: timelineActivityFlatObjectMetadata,
    });

    // pg_attribute scoped to the single table, not the instance-wide
    // information_schema.columns view, which is slow on many-tenant instances.
    const rows = await dataSource.query<{ exists: boolean }[]>(
      `SELECT EXISTS (
         SELECT 1 FROM pg_attribute
         WHERE attrelid = to_regclass($1)
           AND attname = $2
           AND NOT attisdropped
       ) AS "exists"`,
      [`"${schemaName}"."${tableName}"`, columnName],
    );

    return rows[0]?.exists === true;
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
