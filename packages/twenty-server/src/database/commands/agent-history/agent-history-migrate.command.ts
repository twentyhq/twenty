import { Command, Option } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import {
  type RunOnWorkspaceArgs,
  type WorkspaceCommandOptions,
} from 'src/database/commands/command-runners/workspace.command-runner';
import { AgentHistoryMigrationService } from 'src/database/commands/agent-history/agent-history-migration.service';
import { AgentHistorySchemaService } from 'src/database/commands/agent-history/agent-history-schema.service';

type Options = WorkspaceCommandOptions & {
  target?: 'core' | 'workspace';
  batchSize?: number;
  routingDeployed?: boolean;
  abort?: boolean;
};

@Command({
  name: 'agent-history:migrate',
  description:
    'Prepare, copy, verify and switch AI history storage per workspace; rerun to resume',
})
export class AgentHistoryMigrateCommand extends ProvisionedWorkspaceCommandRunner<Options> {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly schema: AgentHistorySchemaService,
    private readonly migration: AgentHistoryMigrationService,
  ) {
    super(workspaceIteratorService);
  }

  @Option({
    flags: '--target <storage>',
    description: 'workspace (default) or core (verified rollback)',
  })
  parseTarget(value: string): 'core' | 'workspace' {
    if (value !== 'core' && value !== 'workspace') {
      throw new Error('Target must be core or workspace');
    }
    return value;
  }

  @Option({
    flags: '--batch-size <count>',
    description: 'Rows per committed batch, from 1 to 10000 (default 1000)',
  })
  parseBatchSize(value: string): number {
    const size = Number(value);
    if (!Number.isInteger(size) || size < 1 || size > 10000) {
      throw new Error('Invalid batch size');
    }
    return size;
  }

  @Option({
    flags: '--routing-deployed',
    description:
      'Confirm every API server, worker and command runner runs migration-aware history persistence',
  })
  parseRoutingDeployed(): boolean {
    return true;
  }

  @Option({
    flags: '--abort',
    description:
      'Discard an incomplete destination copy and restore the unchanged source route',
  })
  parseAbort(): boolean {
    return true;
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs<Options>): Promise<void> {
    const dryRun = options.dryRun ?? false;
    if (options.abort) {
      await this.migration.abort({ workspaceId, dryRun });
      return;
    }
    if (!dryRun && !options.routingDeployed) {
      throw new Error(
        'Deploy all history routing code first, then pass --routing-deployed',
      );
    }
    await this.schema.prepare(workspaceId, dryRun);
    if (dryRun) {
      await this.migration.inspect(workspaceId);
      this.logger.log(
        `[DRY RUN] Validated schema preparation for ${workspaceId}; no rows or routes changed`,
      );
      return;
    }
    await this.migration.migrate({
      workspaceId,
      target: options.target ?? 'workspace',
      batchSize: options.batchSize ?? 1000,
    });
  }
}
