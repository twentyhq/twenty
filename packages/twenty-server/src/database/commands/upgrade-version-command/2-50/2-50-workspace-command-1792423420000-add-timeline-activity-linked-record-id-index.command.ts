import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { getStandardFlatEntitiesToCreateOrThrow } from 'src/database/commands/upgrade-version-command/2-10/utils/get-standard-flat-entities-to-create-or-throw.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

const TIMELINE_ACTIVITY = STANDARD_OBJECTS.timelineActivity;

const LINKED_RECORD_ID_INDEX_UNIVERSAL_IDENTIFIER =
  TIMELINE_ACTIVITY.indexes.linkedRecordIdIndex.universalIdentifier;

@RegisteredWorkspaceCommand('2.50.0', 1792423420000)
@Command({
  name: 'upgrade:2-50:add-timeline-activity-linked-record-id-index',
  description:
    'Index timelineActivity.linkedRecordId so linked activities can follow their source record without scanning the table',
})
export class AddTimelineActivityLinkedRecordIdIndexCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
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

    const timelineActivityFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: TIMELINE_ACTIVITY.universalIdentifier,
      });

    const linkedRecordIdFlatFieldMetadata =
      findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
        flatEntityMaps: flatFieldMetadataMaps,
        universalIdentifier:
          TIMELINE_ACTIVITY.fields.linkedRecordId.universalIdentifier,
      });

    if (
      !isDefined(timelineActivityFlatObjectMetadata) ||
      !isDefined(linkedRecordIdFlatFieldMetadata)
    ) {
      this.logger.log(
        `timelineActivity.linkedRecordId not found for workspace ${workspaceId}, skipping`,
      );

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

    const [indexToCreate] =
      getStandardFlatEntitiesToCreateOrThrow<FlatIndexMetadata>({
        standardFlatEntityMaps: standardAllFlatEntityMaps.flatIndexMaps,
        existingFlatEntityMaps: flatIndexMaps,
        universalIdentifiers: [LINKED_RECORD_ID_INDEX_UNIVERSAL_IDENTIFIER],
      });

    if (!isDefined(indexToCreate)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would create index ${indexToCreate.name} for workspace ${workspaceId}`,
      );

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

      const invalidIndexes = await dataSource.query<{ name: string }[]>(
        `SELECT c.relname AS name
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = $2 AND NOT i.indisvalid`,
        [schemaName, indexToCreate.name],
      );

      for (const { name } of invalidIndexes) {
        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName: name,
        });

        this.logger.warn(
          `Dropped invalid index ${name} left by an interrupted build in workspace ${workspaceId}, recreating it`,
        );
      }

      await this.workspaceSchemaManagerService.indexManager.createIndex({
        queryRunner,
        schemaName,
        tableName,
        index: {
          name: indexToCreate.name,
          columns: [linkedRecordIdFlatFieldMetadata.name],
          isUnique: indexToCreate.isUnique,
          type: indexToCreate.indexType,
          where: indexToCreate.indexWhereClause ?? undefined,
        },
        concurrently: true,
      });
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    await this.runIndexMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatEntityToCreate: [indexToCreate],
      flatEntityToDelete: [],
    });

    this.logger.log(
      `Created index ${indexToCreate.name} for workspace ${workspaceId}`,
    );
  }

  async down({ workspaceId, options }: RunOnWorkspaceArgs): Promise<void> {
    const { flatIndexMaps } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['flatIndexMaps'],
    );

    const indexToDelete =
      findFlatEntityByUniversalIdentifier<FlatIndexMetadata>({
        flatEntityMaps: flatIndexMaps,
        universalIdentifier: LINKED_RECORD_ID_INDEX_UNIVERSAL_IDENTIFIER,
      });

    if (!isDefined(indexToDelete)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would drop index ${indexToDelete.name} for workspace ${workspaceId}`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    await this.runIndexMigration({
      workspaceId,
      applicationUniversalIdentifier:
        twentyStandardFlatApplication.universalIdentifier,
      flatEntityToCreate: [],
      flatEntityToDelete: [indexToDelete],
    });
  }

  private async runIndexMigration({
    workspaceId,
    applicationUniversalIdentifier,
    flatEntityToCreate,
    flatEntityToDelete,
  }: {
    workspaceId: string;
    applicationUniversalIdentifier: string;
    flatEntityToCreate: FlatIndexMetadata[];
    flatEntityToDelete: FlatIndexMetadata[];
  }): Promise<void> {
    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate,
              flatEntityToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
