import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;

// The marketing email work added these two targets without declaring their
// indexes, so they shipped unindexed while the other nine targets were covered.
const MISSING_INDEXES = [
  {
    indexUniversalIdentifier:
      TIMELINE_ACTIVITY.indexes.messageListIdIndex.universalIdentifier,
    fieldUniversalIdentifier:
      TIMELINE_ACTIVITY.fields.targetMessageList.universalIdentifier,
  },
  {
    indexUniversalIdentifier:
      TIMELINE_ACTIVITY.indexes.messageCampaignIdIndex.universalIdentifier,
    fieldUniversalIdentifier:
      TIMELINE_ACTIVITY.fields.targetMessageCampaign.universalIdentifier,
  },
];

@RegisteredWorkspaceCommand('2.33.0', 1787128000000)
@Command({
  name: 'upgrade:2-33:create-timeline-activity-message-target-indexes',
  description:
    'Create the missing BTREE indexes on timelineActivity.targetMessageListId and timelineActivity.targetMessageCampaignId. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class CreateTimelineActivityMessageTargetIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const flatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (!isDefined(flatObjectMetadata)) {
      this.logger.log(
        `timelineActivity object does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    // A workspace that predates the marketing email work has neither the target
    // field nor a column to index, and the standard sync adds both together.
    // The join column is read back off the field so a renamed field still
    // resolves to the column it actually owns.
    const indexesToCreate = MISSING_INDEXES.map(
      ({ indexUniversalIdentifier, fieldUniversalIdentifier }) => {
        const flatFieldMetadata =
          flatFieldMetadataMaps.byUniversalIdentifier[fieldUniversalIdentifier];

        if (
          isDefined(
            flatIndexMaps.byUniversalIdentifier[indexUniversalIdentifier],
          ) ||
          !isDefined(flatFieldMetadata)
        ) {
          return undefined;
        }

        return {
          indexUniversalIdentifier,
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: flatFieldMetadata.name,
          }),
        };
      },
    ).filter(isDefined);

    if (indexesToCreate.length === 0) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const indexBuildPlans = indexesToCreate.map(
      ({ indexUniversalIdentifier, joinColumnName }) => {
        const standardFlatIndexMetadata =
          findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
            flatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
            universalIdentifier: indexUniversalIdentifier,
          });

        if (!isDefined(standardFlatIndexMetadata)) {
          throw new Error(
            `Standard application is missing timelineActivity index ${indexUniversalIdentifier}`,
          );
        }

        return { flatIndexMetadata: standardFlatIndexMetadata, joinColumnName };
      },
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${indexBuildPlans
        .map(({ flatIndexMetadata }) => flatIndexMetadata.name)
        .join(', ')} for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: flatObjectMetadata,
    });

    const queryRunner = dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      for (const { flatIndexMetadata, joinColumnName } of indexBuildPlans) {
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: flatIndexMetadata.name,
            columns: [joinColumnName],
            isUnique: flatIndexMetadata.isUnique,
            type: flatIndexMetadata.indexType,
            where: flatIndexMetadata.indexWhereClause ?? undefined,
          },
          concurrently: true,
        });
      }
    } finally {
      await queryRunner.release();
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: indexBuildPlans.map(
                ({ flatIndexMetadata }) => flatIndexMetadata,
              ),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to persist timelineActivity message target index metadata:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to create timelineActivity message target indexes for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Created ${indexBuildPlans.length} timelineActivity message target index(es) for workspace ${workspaceId}`,
    );
  }
}
