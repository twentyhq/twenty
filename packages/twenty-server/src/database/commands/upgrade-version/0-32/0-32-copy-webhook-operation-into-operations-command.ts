import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import chalk from 'chalk';
import { Repository } from 'typeorm';

import { ActiveWorkspacesCommandRunner } from 'src/database/commands/active-workspaces.command';
import { BaseCommandOptions } from 'src/database/commands/base.command';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

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
      try {
        this.logger.log(`Running command for workspace ${workspaceId}`);

        const webhookRepository =
          await this.twentyORMGlobalManager.getRepositoryForWorkspace(
            workspaceId,
            'webhook',
          );

        const webhooks = await webhookRepository.find();

        for (const webhook of webhooks) {
          if ('operation' in webhook) {
            let newOpe = webhook.operation;

            newOpe = newOpe.replace(/\bcreate\b(?=\.|$)/g, 'created');
            newOpe = newOpe.replace(/\bupdate\b(?=\.|$)/g, 'updated');
            newOpe = newOpe.replace(/\bdelete\b(?=\.|$)/g, 'deleted');
            newOpe = newOpe.replace(/\bdestroy\b(?=\.|$)/g, 'destroyed');

            const [firstWebhookPart, lastWebhookPart] = newOpe.split('.');

            if (
              ['created', 'updated', 'deleted', 'destroyed'].includes(
                firstWebhookPart,
              )
            ) {
              newOpe = `${lastWebhookPart}.${firstWebhookPart}`;
            }

            await webhookRepository.update(webhook.id, {
              operation: newOpe,
              operations: [newOpe],
            });

            this.logger.log(
              chalk.yellow(
                `Handled webhook operation updates for ${webhook.id}`,
              ),
            );
          }
        }
      } catch (e) {
        this.logger.log(
          chalk.red(
            `Error when running command on workspace ${workspaceId}: ${e}`,
          ),
        );
      }
    }
  }
}
