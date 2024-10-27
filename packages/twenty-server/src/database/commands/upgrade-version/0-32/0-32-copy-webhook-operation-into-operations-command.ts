import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import chalk from 'chalk';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { BaseCommandOptions } from 'src/database/commands/base.command';

@Command({
  name: 'upgrade-0.32:copy-webhook-operation-into-operations',
  description:
    'Read, transform and copy webhook from deprecated column operation into newly created column operations',
})
export class CopyWebhookOperationIntoOperationsCommand extends ActiveWorkspacesCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    private readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository);
  }

  async executeActiveWorkspacesCommand(
    passedParams: string[],
    options: BaseCommandOptions,
    activeWorkspaceIds: string[],
  ): Promise<void> {
    this.logger.log('Running command to copy operation to operations');

    for (const workspaceId of activeWorkspaceIds) {
      this.logger.log(`Running command for workspace ${workspaceId}`);

      const webhookRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace(
          workspaceId,
          'webhook',
        );

      const webhooks = await webhookRepository.find();

      for (const webhook of webhooks) {
        if ('operation' in webhook) {
          await webhookRepository.update(webhook.id, {
            operations: [webhook.operation],
          });
          this.logger.log(
            chalk.yellow(`Copied webhook operation to operations`),
          );
        }
      }
    }
  }
}
