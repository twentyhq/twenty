import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1790155020340)
@Command({
  name: 'upgrade:2-42:delete-core-workflows-of-soft-deleted-workflows',
  description:
    'Delete core workflows whose only workspace workflows are soft-deleted',
})
export class DeleteCoreWorkflowsOfSoftDeletedWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const schema = getWorkspaceSchemaName(workspaceId);

    const referencingWorkspaceWorkflows = `
      SELECT 1
      FROM "${schema}"."workflow" ww
      WHERE (ww."coreWorkflowId" = c.id OR ww.id = c."workspaceWorkflowId")`;

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    let coreWorkflowIds: string[];

    try {
      const coreWorkflowIdColumns = await queryRunner.query(
        `SELECT 1
         FROM information_schema.columns
         WHERE table_schema = $1
           AND table_name = 'workflow'
           AND column_name = 'coreWorkflowId'
         LIMIT 1`,
        [schema],
      );

      if (coreWorkflowIdColumns.length === 0) {
        return;
      }

      const rows: { id: string }[] = await queryRunner.query(
        `SELECT c.id
         FROM core."workflow" c
         WHERE c."workspaceId" = $1
           AND EXISTS (${referencingWorkspaceWorkflows} AND ww."deletedAt" IS NOT NULL)
           AND NOT EXISTS (${referencingWorkspaceWorkflows} AND ww."deletedAt" IS NULL)`,
        [workspaceId],
      );

      coreWorkflowIds = rows.map(({ id }) => id);
    } finally {
      await queryRunner.release();
    }

    if (coreWorkflowIds.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${coreWorkflowIds.length} core workflow(s) of soft-deleted workflows for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
    ]);

    const { flatWorkflowMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatWorkflowMaps',
      ]);

    const flatWorkflowsToDelete = coreWorkflowIds
      .map((coreWorkflowId) =>
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: coreWorkflowId,
          flatEntityMaps: flatWorkflowMaps,
        }),
      )
      .filter(isDefined);

    if (flatWorkflowsToDelete.length === 0) {
      return;
    }

    const { workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            workspaceCustomFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            workflow: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatWorkflowsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }

    this.logger.log(
      `Deleted ${flatWorkflowsToDelete.length} core workflow(s) of soft-deleted workflows for workspace ${workspaceId}`,
    );
  }
}
