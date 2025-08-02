import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, In, QueryRunner, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-3:assign-roles-to-existing-api-keys',
  description:
    'Assign Admin roles to existing API keys that lack role assignments. ' +
    'This ensures existing integrations continue to work after enabling role-based permissions.',
})
export class AssignRolesToExistingApiKeysCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
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
      `Assigning roles to existing API keys for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      await queryRunner.startTransaction();

      try {
        const result = await this.assignRolesToWorkspaceApiKeys(
          workspaceId,
          options.dryRun ?? false,
          queryRunner,
        );

        if (result.failed.length > 0) {
          this.logger.warn(
            `Workspace ${workspaceId}: Processed ${result.processed}, Assigned roles to ${result.assigned} API keys, Failed: ${result.failed.length}`,
          );
          this.logger.warn(
            `Failed API keys: ${result.failed.map((f) => `${f.name} (${f.id}): ${f.error}`).join(', ')}`,
          );
          throw new Error(
            `Failed to assign roles to ${result.failed.length} API keys`,
          );
        }

        this.logger.log(
          `Workspace ${workspaceId}: Processed ${result.processed}, Assigned roles to ${result.assigned} API keys`,
        );

        if (options.dryRun) {
          this.logger.log(
            `DRY RUN: Would enable IS_API_KEY_ROLES_ENABLED feature flag for workspace ${workspaceId}`,
          );
        } else {
          const shouldEnableFeatureFlagAndRecomputeCache =
            result.assigned > 0 ||
            (await this.shouldEnableForZeroApiKeys(workspaceId));

          if (shouldEnableFeatureFlagAndRecomputeCache) {
            await this.enableApiKeyRolesFeatureFlagWithTransaction(
              workspaceId,
              result,
              queryRunner,
            );
          } else {
            this.logger.log(
              `All API keys already have roles and feature flag IS_API_KEY_ROLES_ENABLED already enabled for workspace ${workspaceId}, no action needed`,
            );
          }

          await queryRunner.commitTransaction();

          if (shouldEnableFeatureFlagAndRecomputeCache) {
            try {
              await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache(
                {
                  workspaceId,
                },
              );
              await this.workspaceFeatureFlagsMapCacheService.recomputeFeatureFlagsMapCache(
                {
                  workspaceId,
                },
              );
              this.logger.log(
                `Recomputed API key role cache and feature flag cache for workspace ${workspaceId}`,
              );
            } catch (error) {
              this.logger.warn(
                `Failed to recompute API key role cache and feature flag cache for workspace ${workspaceId}: ${error.message}`,
              );
            }
          }
        }
      } catch (error) {
        if (queryRunner.isTransactionActive) {
          await queryRunner.rollbackTransaction();
          this.logger.error(
            `Transaction rolled back for workspace ${workspaceId} due to error: ${error.message}`,
          );
        }

        throw error;
      }
    } catch (error) {
      this.logger.error(
        `Failed to assign roles to existing API keys for workspace ${workspaceId}: ${error.message}`,
      );

      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  private async assignRolesToWorkspaceApiKeys(
    workspaceId: string,
    dryRun: boolean,
    queryRunner: QueryRunner,
  ): Promise<{
    processed: number;
    assigned: number;
    failed: Array<{ id: string; name: string; error: string }>;
  }> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'workspaceId'],
    });

    if (apiKeys.length === 0) {
      this.logger.log(`No API keys found in workspace ${workspaceId}`);

      return { processed: 0, assigned: 0, failed: [] };
    }

    this.logger.log(
      `Found ${apiKeys.length} API keys in workspace ${workspaceId}`,
    );

    const apiKeyIds = apiKeys.map((key) => key.id);
    const existingRoleTargets = await this.roleTargetsRepository.find({
      where: {
        workspaceId,
        apiKeyId: In(apiKeyIds),
      },
    });

    const apiKeysWithRoles = new Set(
      existingRoleTargets.map((rt) => rt.apiKeyId),
    );
    const apiKeysWithoutRoles = apiKeys.filter(
      (key) => !apiKeysWithRoles.has(key.id),
    );

    if (apiKeysWithoutRoles.length === 0) {
      this.logger.log(
        `All API keys already have role assignments for workspace ${workspaceId}`,
      );

      return { processed: apiKeys.length, assigned: 0, failed: [] };
    }

    this.logger.log(
      `${dryRun ? 'DRY RUN: ' : ''}Found ${apiKeysWithoutRoles.length} API keys without role assignments for workspace ${workspaceId}`,
    );

    if (dryRun) {
      this.logger.log(
        `DRY RUN: Would assign Admin roles to ${apiKeysWithoutRoles.length} API keys for workspace ${workspaceId}`,
      );

      return {
        processed: apiKeys.length,
        assigned: apiKeysWithoutRoles.length,
        failed: [],
      };
    }

    const adminRole = await this.roleRepository.findOne({
      where: {
        workspaceId,
        label: ADMIN_ROLE_LABEL,
      },
    });

    if (!adminRole) {
      throw new Error(
        `No Admin role found in workspace ${workspaceId}. Should not happen.`,
      );
    }

    this.logger.log(
      `Using Admin role ${adminRole.id} for workspace ${workspaceId}`,
    );

    try {
      let assignedCount = 0;

      for (const apiKey of apiKeysWithoutRoles) {
        await queryRunner.manager.delete(RoleTargetsEntity, {
          apiKeyId: apiKey.id,
          workspaceId,
        });

        const roleTarget = queryRunner.manager.create(RoleTargetsEntity, {
          apiKeyId: apiKey.id,
          roleId: adminRole.id,
          workspaceId,
        });

        await queryRunner.manager.save(roleTarget);

        this.logger.log(
          `Assigned Admin role to API key "${apiKey.name}" (${apiKey.id})`,
        );
        assignedCount++;
      }

      this.logger.log(
        `Successfully assigned roles to ${assignedCount} API keys for workspace ${workspaceId}`,
      );

      return {
        processed: apiKeys.length,
        assigned: assignedCount,
        failed: [],
      };
    } catch (error) {
      this.logger.error(
        `Failed to assign roles to API keys for workspace ${workspaceId}: ${error.message}`,
      );

      const errorMessage =
        error instanceof Error ? error.message : String(error);
      const failedApiKeys = apiKeysWithoutRoles.map((apiKey) => ({
        id: apiKey.id,
        name: apiKey.name,
        error: errorMessage,
      }));

      return {
        processed: apiKeys.length,
        assigned: 0,
        failed: failedApiKeys,
      };
    }
  }

  private async enableApiKeyRolesFeatureFlagWithTransaction(
    workspaceId: string,
    result: { processed: number; assigned: number },
    queryRunner: QueryRunner,
  ): Promise<void> {
    const shouldEnableFeatureFlag =
      result.processed > 0 ||
      (await this.shouldEnableForZeroApiKeys(workspaceId));

    if (shouldEnableFeatureFlag) {
      try {
        const existingFeatureFlag = await queryRunner.manager.findOne(
          FeatureFlag,
          {
            where: {
              key: FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
              workspaceId: workspaceId,
            },
          },
        );

        const featureFlagToSave = existingFeatureFlag
          ? {
              ...existingFeatureFlag,
              value: true,
            }
          : {
              key: FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
              value: true,
              workspaceId: workspaceId,
            };

        await queryRunner.manager.save(FeatureFlag, featureFlagToSave);

        this.logger.log(
          `Enabled IS_API_KEY_ROLES_ENABLED feature flag for workspace ${workspaceId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to enable feature flag for workspace ${workspaceId}: ${error.message}`,
        );
        throw new Error(
          `Failed to enable API key roles feature flag for workspace ${workspaceId}: ${error.message}`,
        );
      }
    } else {
      this.logger.log(
        `Feature flag already enabled for workspace ${workspaceId}`,
      );
    }
  }

  private async shouldEnableForZeroApiKeys(
    workspaceId: string,
  ): Promise<boolean> {
    const isAlreadyEnabled = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_API_KEY_ROLES_ENABLED,
      workspaceId,
    );

    return !isAlreadyEnabled;
  }
}
