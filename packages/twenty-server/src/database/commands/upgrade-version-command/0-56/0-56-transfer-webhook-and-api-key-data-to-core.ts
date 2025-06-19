import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
    ActiveOrSuspendedWorkspacesMigrationCommandRunner,
    RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';

@Injectable()
@Command({
  name: 'upgrade:0-56:transfer-webhook-and-api-key-data-to-core',
  description:
    'Transfer webhook and API key data from workspace schemas to core schema',
})
export class TransferWebhookAndApiKeyToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly webhookService: WebhookService,
    private readonly apiKeyService: ApiKeyService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  async runOnWorkspace({ options, workspaceId }: RunOnWorkspaceArgs) {
    const dryRun = options.dryRun ?? false;

    this.logger.log(
      `${dryRun ? '[DRY RUN] ' : ''}Transferring webhook and API key data for workspace ${workspaceId}`,
    );

    try {
      // Transfer both webhook and API key data
      await Promise.all([
        this.transferWebhookData({ workspaceId, dryRun }),
        this.transferApiKeyData({ workspaceId, dryRun }),
      ]);

      this.logger.log(
        `${dryRun ? '[DRY RUN] ' : ''}Successfully completed data transfer for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to transfer data for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
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
      const webhookWorkspaceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
          workspaceId,
          'webhook',
        );

      // Get all webhooks from workspace schema
      const webhooks = await webhookWorkspaceRepository.find();

      this.logger.log(
        `Found ${webhooks.length} webhooks in workspace ${workspaceId}`,
      );

      if (webhooks.length === 0) {
        this.logger.log(`No webhooks to transfer for workspace ${workspaceId}`);

        return;
      }

      if (!dryRun) {
        // Transfer webhooks to core schema using service
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
                description: webhook.description || undefined,
                secret: webhook.secret,
                workspaceId,
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

  private async transferApiKeyData({
    workspaceId,
    dryRun,
  }: {
    workspaceId: string;
    dryRun: boolean;
  }) {
    try {
      // Get API key repository for this workspace using Twenty ORM
      const apiKeyWorkspaceRepository =
        await this.twentyORMGlobalManager.getRepositoryForWorkspace<ApiKeyWorkspaceEntity>(
          workspaceId,
          'apiKey',
        );

      // Get all API keys from workspace schema
      const apiKeys = await apiKeyWorkspaceRepository.find();

      this.logger.log(
        `Found ${apiKeys.length} API keys in workspace ${workspaceId}`,
      );

      if (apiKeys.length === 0) {
        this.logger.log(`No API keys to transfer for workspace ${workspaceId}`);

        return;
      }

      if (!dryRun) {
        // Transfer API keys to core schema using service
        for (const apiKey of apiKeys) {
          try {
            // Check if API key already exists in core schema
            const existingApiKey = await this.apiKeyService.findById(
              apiKey.id,
              workspaceId,
            );

            if (!existingApiKey) {
              // Create API key in core schema using service
              await this.apiKeyService.create({
                id: apiKey.id,
                name: apiKey.name,
                expiresAt: new Date(apiKey.expiresAt),
                revokedAt: apiKey.revokedAt
                  ? new Date(apiKey.revokedAt)
                  : undefined,
                workspaceId,
              });
            }
          } catch (error) {
            this.logger.error(
              `Failed to transfer API key ${apiKey.id} for workspace ${workspaceId}: ${error.message}`,
            );
            throw error;
          }
        }

        this.logger.log(
          `Successfully transferred ${apiKeys.length} API keys from workspace ${workspaceId} to core schema`,
        );
      } else {
        this.logger.log(
          `[DRY RUN] Would transfer ${apiKeys.length} API keys from workspace ${workspaceId} to core schema`,
        );
      }
    } catch (error) {
      // If the workspace doesn't have API key table or any other error, just log and continue
      if (
        error.message?.includes('relation') &&
        error.message?.includes('does not exist')
      ) {
        this.logger.log(`No API key table found in workspace ${workspaceId}`);

        return;
      }

      throw error;
    }
  }
}
