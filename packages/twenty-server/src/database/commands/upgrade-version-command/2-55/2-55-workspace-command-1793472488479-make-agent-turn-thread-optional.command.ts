import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

@RegisteredWorkspaceCommand('2.55.0', 1793472488479)
@Command({
  name: 'upgrade:2-55:make-agent-turn-thread-optional',
  description:
    'Let a one-shot AI run record its turn without a conversation thread',
})
export class MakeAgentTurnThreadOptionalCommand extends ProvisionedWorkspaceCommandRunner {
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
    const [table] = await dataSource.query('SELECT to_regclass($1) AS name', [
      `"${schema}"."agentTurn"`,
    ]);

    if (!isDefined(table?.name)) {
      this.logger.log(
        `Agent turn table absent in workspace ${workspaceId}, skipping`,
      );

      return;
    }

    await dataSource.query(
      `ALTER TABLE "${schema}"."agentTurn" ALTER COLUMN "threadId" DROP NOT NULL`,
    );
    await dataSource.query(
      `UPDATE core."fieldMetadata" field
       SET "isNullable" = true
       FROM core."objectMetadata" object
       WHERE field."objectMetadataId" = object.id
         AND object."workspaceId" = $1
         AND object."nameSingular" = 'agentTurn'
         AND field.name = 'thread'`,
      [workspaceId],
    );
    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ],
      workspaceId,
    });
  }
}
