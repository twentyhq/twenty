import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.42.0', 1789593132222)
@Command({
  name: 'upgrade:2-42:make-workflow-run-projection-relations-nullable',
  description:
    'Allow core-only workflows to persist runs without rollback projection relations',
})
export class MakeWorkflowRunProjectionRelationsNullableCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource) || options.dryRun) {
      return;
    }

    const schema = getWorkspaceSchemaName(workspaceId);
    const [table] = await dataSource.query(
      'SELECT to_regclass($1) AS name',
      [`"${schema}"."workflowRun"`],
    );

    if (!isDefined(table?.name)) {
      this.logger.log(`Workflow run table absent in workspace ${workspaceId}, skipping projection relations`);

      return;
    }

    await dataSource.query(
      `ALTER TABLE "${schema}"."workflowRun"
       ALTER COLUMN "workflowId" DROP NOT NULL,
       ALTER COLUMN "workflowVersionId" DROP NOT NULL`,
    );
    await dataSource.query(
      `UPDATE core."fieldMetadata" field
       SET "isNullable" = true
       FROM core."objectMetadata" object
       WHERE field."objectMetadataId" = object.id
         AND object."workspaceId" = $1
         AND object."nameSingular" = 'workflowRun'
         AND field.name IN ('workflow', 'workflowVersion')`,
      [workspaceId],
    );
    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: ['flatFieldMetadataMaps', 'flatObjectMetadataMaps'],
      workspaceId,
    });
  }
}
