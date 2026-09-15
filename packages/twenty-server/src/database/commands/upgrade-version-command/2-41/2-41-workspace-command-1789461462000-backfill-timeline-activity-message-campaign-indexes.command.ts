import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { type UniversalFlatIndexMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-index-metadata.type';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;

const INDEXES_TO_BACKFILL = [
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
] as const;

// The standard application is only synchronized when a workspace is created,
// so declaring the two indexes in STANDARD_OBJECTS leaves every existing
// workspace without them. Physical indexes are created CONCURRENTLY outside
// the migration transaction first: a plain CREATE INDEX would hold a
// write-blocking lock for the whole build on large timelineActivity tables
// and trip the runner's lock timeout. The migration then persists the
// metadata, its CREATE INDEX IF NOT EXISTS finding the index already there.
@RegisteredWorkspaceCommand('2.41.0', 1789461462000)
@Command({
  name: 'upgrade:2-41:backfill-timeline-activity-message-campaign-indexes',
  description:
    'Create the standard messageList and messageCampaign join column indexes on timelineActivity for existing workspaces. Indexes are created with CONCURRENTLY so writes are not blocked.',
})
export class BackfillTimelineActivityMessageCampaignIndexesCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    if (!dataSource) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const timelineActivityFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    if (!isDefined(timelineActivityFlatObjectMetadata)) {
      this.logger.log(
        `timelineActivity object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const now = new Date().toISOString();
    const flatIndexBuildPlans: {
      universalFlatIndexMetadata: UniversalFlatIndexMetadata;
      joinColumnName: string;
    }[] = [];

    for (const {
      indexUniversalIdentifier,
      fieldUniversalIdentifier,
    } of INDEXES_TO_BACKFILL) {
      if (isDefined(flatIndexMaps.byUniversalIdentifier[indexUniversalIdentifier])) {
        continue;
      }

      const flatFieldMetadata =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: fieldUniversalIdentifier,
        });

      if (!isDefined(flatFieldMetadata)) {
        this.logger.log(
          `Field ${fieldUniversalIdentifier} not found on timelineActivity for workspace ${workspaceId}, skipping its index`,
        );
        continue;
      }

      const universalFlatIndexMetadata =
        generateFlatIndexMetadataWithNameOrThrow({
          flatObjectMetadata: timelineActivityFlatObjectMetadata,
          objectFlatFieldMetadatas: [flatFieldMetadata],
          flatIndex: {
            createdAt: now,
            updatedAt: now,
            universalIdentifier: indexUniversalIdentifier,
            applicationUniversalIdentifier:
              TWENTY_STANDARD_APPLICATION.universalIdentifier,
            objectMetadataUniversalIdentifier:
              timelineActivityFlatObjectMetadata.universalIdentifier,
            indexType: IndexType.BTREE,
            indexWhereClause: null,
            isCustom: false,
            isUnique: false,
            isSystemSideEffect: true,
            universalFlatIndexFieldMetadatas: [
              {
                createdAt: now,
                updatedAt: now,
                indexMetadataUniversalIdentifier: indexUniversalIdentifier,
                fieldMetadataUniversalIdentifier:
                  flatFieldMetadata.universalIdentifier,
                order: 0,
                subFieldName: null,
              },
            ],
          },
        });

      flatIndexBuildPlans.push({
        universalFlatIndexMetadata,
        joinColumnName: computeMorphOrRelationFieldJoinColumnName({
          name: flatFieldMetadata.name,
        }),
      });
    }

    if (flatIndexBuildPlans.length === 0) {
      this.logger.log(
        `timelineActivity message campaign indexes already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating ${flatIndexBuildPlans.length} timelineActivity index(es) for workspace ${workspaceId}: ${flatIndexBuildPlans
        .map(({ universalFlatIndexMetadata }) => universalFlatIndexMetadata.name)
        .join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: timelineActivityFlatObjectMetadata,
    });

    const queryRunner = dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      for (const {
        universalFlatIndexMetadata,
        joinColumnName,
      } of flatIndexBuildPlans) {
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: universalFlatIndexMetadata.name,
            columns: [joinColumnName],
            isUnique: universalFlatIndexMetadata.isUnique,
            type: universalFlatIndexMetadata.indexType,
            where: universalFlatIndexMetadata.indexWhereClause ?? undefined,
          },
          concurrently: true,
        });

        this.logger.log(
          `Created index ${universalFlatIndexMetadata.name} on workspace ${workspaceId}`,
        );
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: flatIndexBuildPlans.map(
                ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata,
              ),
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to persist timelineActivity index metadata:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to persist timelineActivity index metadata for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Backfilled ${flatIndexBuildPlans.length} timelineActivity index(es) for workspace ${workspaceId}`,
    );
  }
}
