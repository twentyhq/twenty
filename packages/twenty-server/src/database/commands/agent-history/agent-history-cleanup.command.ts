import { Command, Option } from 'nest-commander';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';

type Options = WorkspaceCommandOptions & {
  retentionDays?: number;
  routingDeployed?: boolean;
};

@Command({
  name: 'agent-history:cleanup',
  description:
    'Delete obsolete core snapshots after verified cutover and the rollback retention window',
})
export class AgentHistoryCleanupCommand extends ProvisionedWorkspaceCommandRunner<Options> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly migration: AgentHistoryMigrationService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--retention-days <days>',
    description: 'Minimum age of verified cutover (default 14, minimum 1)',
  })
  parseRetentionDays(value: string): number {
    const days = Number(value);
    if (!Number.isInteger(days) || days < 1) {
      throw new Error('Retention must be at least one day');
    }
    return days;
  }

  @Option({
    flags: '--routing-deployed',
    description:
      'Confirm every API server, worker and command runner runs migration-aware history persistence',
  })
  parseRoutingDeployed(): boolean {
    return true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs<Options>): Promise<void> {
    if (!options.dryRun && !options.routingDeployed) {
      throw new Error(
        'Deploy all history routing code first, then pass --routing-deployed',
      );
    }
    await this.migration.cleanup({
      workspaceId,
      dryRun: options.dryRun ?? false,
      retentionDays: options.retentionDays ?? 14,
    });
  }
}
