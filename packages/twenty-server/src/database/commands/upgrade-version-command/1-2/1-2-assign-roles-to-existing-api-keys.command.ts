import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { ADMIN_ROLE_LABEL } from 'src/engine/metadata-modules/permissions/constants/admin-role-label.constants';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-2:assign-roles-to-existing-api-keys',
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
    private readonly apiKeyRoleService: ApiKeyRoleService,
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
      `Assigning roles to existing API keys for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    try {
      const result = await this.assignRolesToWorkspaceApiKeys(
        workspaceId,
        options.dryRun ?? false,
      );

      this.logger.log(
        `  ✅ Workspace ${workspaceId}: Processed ${result.processed}, Assigned roles to ${result.assigned} API keys`,
      );
    } catch (error) {
      this.logger.error(
        `  ❌ Failed to assign roles to API keys for workspace ${workspaceId}:`,
        error,
      );
      if (!options.dryRun) {
        throw error;
      }
    }
  }

  private async assignRolesToWorkspaceApiKeys(
    workspaceId: string,
    dryRun: boolean,
  ): Promise<{ processed: number; assigned: number }> {
    const apiKeys = await this.apiKeyRepository.find({
      where: { workspaceId },
      select: ['id', 'name', 'workspaceId'],
    });

    if (apiKeys.length === 0) {
      this.logger.log(`    No API keys found in workspace ${workspaceId}`);

      return { processed: 0, assigned: 0 };
    }

    this.logger.log(`    Found ${apiKeys.length} API keys in workspace`);

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
      this.logger.log(`    All API keys already have role assignments`);

      return { processed: apiKeys.length, assigned: 0 };
    }

    this.logger.log(
      `    Found ${apiKeysWithoutRoles.length} API keys without role assignments`,
    );

    if (dryRun) {
      this.logger.log(
        `    [DRY RUN] Would assign Admin roles to ${apiKeysWithoutRoles.length} API keys`,
      );

      return {
        processed: apiKeys.length,
        assigned: apiKeysWithoutRoles.length,
      };
    }

    const adminRole = await this.roleRepository.findOne({
      where: {
        workspaceId,
        label: ADMIN_ROLE_LABEL,
      },
    });

    if (!adminRole) {
      this.logger.warn(
        `    No Admin role found in workspace ${workspaceId}, skipping...`,
      );

      return { processed: apiKeys.length, assigned: 0 };
    }

    this.logger.log(`    Using Admin role: ${adminRole.id}`);

    let assignedCount = 0;

    for (const apiKey of apiKeysWithoutRoles) {
      try {
        await this.apiKeyRoleService.assignRoleToApiKey({
          apiKeyId: apiKey.id,
          roleId: adminRole.id,
          workspaceId,
        });

        this.logger.log(
          `      ✅ Assigned Admin role to API key "${apiKey.name}" (${apiKey.id})`,
        );
        assignedCount++;
      } catch (error) {
        this.logger.error(
          `      ❌ Failed to assign role to API key "${apiKey.name}" (${apiKey.id}):`,
          error,
        );
      }
    }

    return { processed: apiKeys.length, assigned: assignedCount };
  }
}
