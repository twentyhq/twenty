import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyService } from 'src/engine/core-modules/api-key/api-key.service';
import { Webhook } from 'src/engine/core-modules/webhook/webhook.entity';
import { WebhookService } from 'src/engine/core-modules/webhook/webhook.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';
import { WebhookWorkspaceEntity } from 'src/modules/webhook/standard-objects/webhook.workspace-entity';

@Command({
  name: 'upgrade:1-1:migrate-api-keys-webhooks-to-core',
  description:
    'Migrate API keys and webhooks from workspace schemas to core schema',
})
export class MigrateApiKeysWebhooksToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ApiKey, 'core')
    private readonly coreApiKeyRepository: Repository<ApiKey>,
    @InjectRepository(Webhook, 'core')
    private readonly coreWebhookRepository: Repository<Webhook>,
    private readonly apiKeyService: ApiKeyService,
    private readonly webhookService: WebhookService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
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
      `Migrating API keys and webhooks for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    try {
      await this.migrateApiKeys(workspaceId, options.dryRun);

      await this.migrateWebhooks(workspaceId, options.dryRun);

      this.logger.log(
        `Successfully migrated API keys and webhooks for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to migrate API keys and webhooks for workspace ${workspaceId}: ${error.message}`,
      );
      throw error;
    }
  }

  private async migrateApiKeys(
    workspaceId: string,
    dryRun?: boolean,
  ): Promise<void> {
    const workspaceApiKeyRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<ApiKeyWorkspaceEntity>(
        workspaceId,
        'apiKey',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceApiKeys = await workspaceApiKeyRepository.find({
      withDeleted: true,
    });

    if (workspaceApiKeys.length === 0) {
      this.logger.log(`No API keys to migrate for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Found ${workspaceApiKeys.length} API keys to migrate for workspace ${workspaceId}`,
    );

    if (dryRun) {
      workspaceApiKeys.forEach((apiKey) => {
        const deletedStatus = apiKey.deletedAt ? ' (DELETED)' : '';

        this.logger.log(
          `DRY RUN: Would migrate API key ${apiKey.id} (${apiKey.name})${deletedStatus} from workspace ${workspaceId}`,
        );
      });

      return;
    }

    const existingCoreApiKeys = await this.coreApiKeyRepository.find({
      where: { workspaceId },
      select: ['id'],
      withDeleted: true,
    });
    const existingApiKeyIds = new Set(existingCoreApiKeys.map((ak) => ak.id));

    for (const workspaceApiKey of workspaceApiKeys) {
      if (existingApiKeyIds.has(workspaceApiKey.id)) {
        this.logger.warn(
          `API key ${workspaceApiKey.id} already exists in core schema for workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      await this.apiKeyService.create({
        id: workspaceApiKey.id,
        name: workspaceApiKey.name,
        expiresAt: workspaceApiKey.expiresAt,
        revokedAt: workspaceApiKey.revokedAt
          ? new Date(workspaceApiKey.revokedAt)
          : workspaceApiKey.deletedAt
            ? new Date(workspaceApiKey.deletedAt)
            : undefined,
        workspaceId,
        createdAt: new Date(workspaceApiKey.createdAt),
        updatedAt: new Date(workspaceApiKey.updatedAt),
      });

      const deletedStatus = workspaceApiKey.deletedAt ? ' (DELETED)' : '';

      this.logger.log(
        `Migrated API key ${workspaceApiKey.id} (${workspaceApiKey.name})${deletedStatus} to core schema`,
      );
    }
  }

  private async migrateWebhooks(
    workspaceId: string,
    dryRun?: boolean,
  ): Promise<void> {
    const workspaceWebhookRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WebhookWorkspaceEntity>(
        workspaceId,
        'webhook',
        { shouldBypassPermissionChecks: true },
      );

    const workspaceWebhooks = await workspaceWebhookRepository.find({
      withDeleted: true,
    });

    if (workspaceWebhooks.length === 0) {
      this.logger.log(`No webhooks to migrate for workspace ${workspaceId}`);

      return;
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Found ${workspaceWebhooks.length} webhooks to migrate for workspace ${workspaceId}`,
    );

    if (dryRun) {
      workspaceWebhooks.forEach((webhook) => {
        const deletedStatus = webhook.deletedAt ? ' (DELETED)' : '';

        this.logger.log(
          `DRY RUN: Would migrate webhook ${webhook.id} (${webhook.targetUrl})${deletedStatus} from workspace ${workspaceId}`,
        );
      });

      return;
    }

    const existingCoreWebhooks = await this.coreWebhookRepository.find({
      where: { workspaceId },
      select: ['id'],
      withDeleted: true,
    });
    const existingWebhookIds = new Set(existingCoreWebhooks.map((wh) => wh.id));

    for (const workspaceWebhook of workspaceWebhooks) {
      if (existingWebhookIds.has(workspaceWebhook.id)) {
        this.logger.warn(
          `Webhook ${workspaceWebhook.id} already exists in core schema for workspace ${workspaceId}, skipping`,
        );
        continue;
      }

      await this.webhookService.create({
        id: workspaceWebhook.id,
        targetUrl: workspaceWebhook.targetUrl,
        operations: workspaceWebhook.operations,
        description: workspaceWebhook.description,
        secret: workspaceWebhook.secret,
        workspaceId,
        createdAt: new Date(workspaceWebhook.createdAt),
        updatedAt: new Date(workspaceWebhook.updatedAt),
        deletedAt: workspaceWebhook.deletedAt
          ? new Date(workspaceWebhook.deletedAt)
          : undefined,
      });

      const deletedStatus = workspaceWebhook.deletedAt ? ' (DELETED)' : '';

      this.logger.log(
        `Migrated webhook ${workspaceWebhook.id} (${workspaceWebhook.targetUrl})${deletedStatus} to core schema`,
      );
    }
  }
}
