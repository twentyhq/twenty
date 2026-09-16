import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.41.0', 1789580000002)
@Command({
  name: 'upgrade:2-41:make-workflow-run-projection-relations-nullable',
  description:
    'Allow core-only workflows to persist runs without rollback projection relations',
})
export class MakeWorkflowRunProjectionRelationsNullableCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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
         AND object.name = 'workflowRun'
         AND field.name IN ('workflow', 'workflowVersion')`,
      [workspaceId],
    );
  }
}
