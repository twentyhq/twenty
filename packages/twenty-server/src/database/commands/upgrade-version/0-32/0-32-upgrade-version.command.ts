import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BackfillViewGroupsCommand } from 'src/database/commands/upgrade-version/0-32/0-32-backfill-view-groups.command';
import { CopyWebhookOperationIntoOperationsCommand } from 'src/database/commands/upgrade-version/0-32/0-32-copy-webhook-operation-into-operations-command';
import { SimplifySearchVectorExpressionCommand } from 'src/database/commands/upgrade-version/0-32/0-32-simplify-search-vector-expression';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { SyncWorkspaceMetadataCommand } from 'src/engine/workspace-manager/workspace-sync-metadata/commands/sync-workspace-metadata.command';

interface UpdateTo0_32CommandOptions {
  workspaceId?: string;
}

@Command({
  name: 'upgrade-0.32',
  description: 'Upgrade to 0.32',
})
export class UpgradeTo0_32Command extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly syncWorkspaceMetadataCommand: SyncWorkspaceMetadataCommand,
    private readonly simplifySearchVectorExpressionCommand: SimplifySearchVectorExpressionCommand,
    private readonly copyWebhookOperationIntoOperationsCommand: CopyWebhookOperationIntoOperationsCommand,
    private readonly backfillViewGroupsCommand: BackfillViewGroupsCommand,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParam: string[],
    options: UpdateTo0_32CommandOptions,
    workspaceIds: string[],
  ): Promise<void> {
    await this.syncWorkspaceMetadataCommand.executeActiveWorkspacesCommand(
      passedParam,
      {
        ...options,
        force: true,
      },
      workspaceIds,
    );

    await this.simplifySearchVectorExpressionCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.copyWebhookOperationIntoOperationsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );

    await this.backfillViewGroupsCommand.executeActiveWorkspacesCommand(
      passedParam,
      options,
      workspaceIds,
    );
  }
}
