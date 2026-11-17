import { Command } from 'nest-commander';
import { IndexType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { WORKFLOW_RUN_CORE_WORKFLOW_ID_CREATED_AT_INDEX } from 'src/database/commands/upgrade-version-command/2-58/constants/workflow-run-core-workflow-id-created-at-index.constant';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { TWENTY_STANDARD_APPLICATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-standard-applications';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const {
  objectUniversalIdentifier,
  indexUniversalIdentifier,
  fieldUniversalIdentifiers,
} = WORKFLOW_RUN_CORE_WORKFLOW_ID_CREATED_AT_INDEX;

@RegisteredWorkspaceCommand('2.58.0', 1794374946191)
@Command({
  name: 'upgrade:2-58:backfill-workflow-run-core-workflow-id-created-at-index',
  description:
    'Create the standard (coreWorkflowId, createdAt) index on workflowRun for existing workspaces. The index is created with CONCURRENTLY so writes are not blocked.',
})
export class BackfillWorkflowRunCoreWorkflowIdCreatedAtIndexCommand extends ProvisionedWorkspaceCommandRunner {
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

    if (
      isDefined(flatIndexMaps.byUniversalIdentifier[indexUniversalIdentifier])
    ) {
      this.logger.log(
        `workflowRun coreWorkflowId/createdAt index already present for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const workflowRunFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: objectUniversalIdentifier,
      });

    if (!isDefined(workflowRunFlatObjectMetadata)) {
      this.logger.log(
        `workflowRun object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const indexFlatFieldMetadatas = fieldUniversalIdentifiers
      .map((fieldUniversalIdentifier) =>
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier: fieldUniversalIdentifier,
        }),
      )
      .filter(isDefined);

    if (indexFlatFieldMetadatas.length !== fieldUniversalIdentifiers.length) {
      this.logger.log(
        `workflowRun coreWorkflowId or createdAt field not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const now = new Date().toISOString();

    const universalFlatIndexMetadata = generateFlatIndexMetadataWithNameOrThrow(
      {
        flatObjectMetadata: workflowRunFlatObjectMetadata,
        objectFlatFieldMetadatas: indexFlatFieldMetadatas,
        flatIndex: {
          createdAt: now,
          updatedAt: now,
          universalIdentifier: indexUniversalIdentifier,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION.universalIdentifier,
          objectMetadataUniversalIdentifier:
            workflowRunFlatObjectMetadata.universalIdentifier,
          indexType: IndexType.BTREE,
          indexWhereClause: null,
          isCustom: false,
          isUnique: false,
          isSystemSideEffect: true,
          universalFlatIndexFieldMetadatas: indexFlatFieldMetadatas.map(
            (flatFieldMetadata, order) => ({
              createdAt: now,
              updatedAt: now,
              indexMetadataUniversalIdentifier: indexUniversalIdentifier,
              fieldMetadataUniversalIdentifier:
                flatFieldMetadata.universalIdentifier,
              order,
              subFieldName: null,
            }),
          ),
        },
      },
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Creating index ${universalFlatIndexMetadata.name} on workflowRun for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: workflowRunFlatObjectMetadata,
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
        [schemaName, universalFlatIndexMetadata.name],
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
          name: universalFlatIndexMetadata.name,
          columns: indexFlatFieldMetadatas.map(({ name }) => name),
          isUnique: false,
          type: IndexType.BTREE,
        },
        concurrently: true,
      });
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: [universalFlatIndexMetadata],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to persist the workflowRun coreWorkflowId/createdAt index metadata for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Created index ${universalFlatIndexMetadata.name} on workflowRun for workspace ${workspaceId}`,
    );
  }
}
