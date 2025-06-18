import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';

@Injectable()
@Command({
  name: 'upgrade:0-54:transfer-webhook-to-core',
  description: 'Transfer webhook data from workspace schemas to core schema',
})
export class TransferWebhookToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly webhookService: WebhookService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running webhook transfer for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.transferWebhookData({
      workspaceId,
      dryRun: !!options.dryRun,
    });
  }

  private async transferWebhookData({
    workspaceId,
    dryRun,
  }: {
    workspaceId: string;
    dryRun: boolean;
  }) {
    try {
      // Get webhook repository for this workspace using Twenty ORM
      const webhookRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
          workspaceId,
          'webhook',
        );

      // Get all webhooks from workspace schema
      const webhooks = await webhookRepository.find();

      this.logger.log(
        `Found ${webhooks.length} webhooks in workspace ${workspaceId}`,
      );

      if (webhooks.length === 0) {
        this.logger.log(`No webhooks to transfer for workspace ${workspaceId}`);

        return;
      }

      if (!dryRun) {
        // Transfer webhooks to core schema using WebhookService
        for (const webhook of webhooks) {
          try {
            // Check if webhook already exists in core schema
            const existingWebhook = await this.webhookService.findById(
              webhook.id,
              workspaceId,
            );

            if (!existingWebhook) {
              // Create webhook in core schema using service
              await this.webhookService.create({
                id: webhook.id,
                targetUrl: webhook.targetUrl,
                operations: webhook.operations,
                description: webhook.description,
                secret: webhook.secret,
                workspaceId,
                createdAt: new Date(webhook.createdAt),
                updatedAt: new Date(webhook.updatedAt),
                deletedAt: webhook.deletedAt
                  ? new Date(webhook.deletedAt)
                  : undefined,
              });
            }
          } catch (error) {
            this.logger.error(
              `Failed to transfer webhook ${webhook.id} for workspace ${workspaceId}: ${error.message}`,
            );
            throw error;
          }
        }

        this.logger.log(
          `Successfully transferred ${webhooks.length} webhooks from workspace ${workspaceId} to core schema`,
        );
      } else {
        this.logger.log(
          `[DRY RUN] Would transfer ${webhooks.length} webhooks from workspace ${workspaceId} to core schema`,
        );
      }
    } catch (error) {
      // If the workspace doesn't have webhook table or any other error, just log and continue
      if (
        error.message?.includes('relation') &&
        error.message?.includes('does not exist')
      ) {
        this.logger.log(`No webhook table found in workspace ${workspaceId}`);

        return;
      }

      throw error;
    }
  }
}
