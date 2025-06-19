import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
    ActiveOrSuspendedWorkspacesMigrationCommandRunner,
    RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { ApiKeyWorkspaceEntity } from 'src/modules/api-key/standard-objects/api-key.workspace-entity';

@Injectable()
@Command({
  name: 'upgrade:0-56:transfer-api-key-data-to-core',
  description: 'Transfer API key data from workspace schemas to core schema',
})
export class TransferApiKeyToCoreCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
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
      `Running API key transfer for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    await this.transferApiKeyData({
      workspaceId,
      dryRun: !!options.dryRun,
    });
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
        // Transfer API keys to core schema
        for (const apiKey of apiKeys) {
          try {
            // Check if API key already exists in core schema
            const existingApiKey = await this.apiKeyRepository.findOne({
              where: {
                id: apiKey.id,
                workspaceId,
              },
            });

            if (!existingApiKey) {
              // Create API key in core schema
              await this.apiKeyRepository.save({
                id: apiKey.id,
                name: apiKey.name,
                expiresAt: new Date(apiKey.expiresAt),
                revokedAt: apiKey.revokedAt
                  ? new Date(apiKey.revokedAt)
                  : undefined,
                workspaceId,
                createdAt: new Date(apiKey.createdAt),
                updatedAt: new Date(apiKey.updatedAt),
                deletedAt: apiKey.deletedAt
                  ? new Date(apiKey.deletedAt)
                  : undefined,
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
