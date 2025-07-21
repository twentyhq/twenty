import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Not, Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
    ApiKeyException,
    ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class ApiKeyRoleService {
  constructor(
    @InjectRepository(RoleTargetsEntity, 'core')
    private readonly roleTargetsRepository: Repository<RoleTargetsEntity>,
    @InjectRepository(RoleEntity, 'core')
    private readonly roleRepository: Repository<RoleEntity>,
    @InjectRepository(Workspace, 'core')
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async assignRoleToApiKey({
    workspaceId,
    apiKeyId,
    roleId,
  }: {
    workspaceId: string;
    apiKeyId: string;
    roleId: string;
  }): Promise<void> {
    const validationResult = await this.validateAssignRoleInput({
      apiKeyId,
      workspaceId,
      roleId,
    });

    if (validationResult?.roleToAssignIsSameAsCurrentRole) {
      return;
    }

    const newRoleTarget = await this.roleTargetsRepository.save({
      roleId,
      apiKeyId,
      workspaceId,
    });

    await this.roleTargetsRepository.delete({
      apiKeyId,
      workspaceId,
      id: Not(newRoleTarget.id),
    });

    // Recompute cache (following user role pattern)
    await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache({
      workspaceId,
    });
  }

  public async removeRoleFromApiKey({
    workspaceId,
    apiKeyId,
  }: {
    workspaceId: string;
    apiKeyId: string;
  }): Promise<void> {
    await this.roleTargetsRepository.delete({
      apiKeyId,
      workspaceId,
    });

    // Recompute cache
    await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache({
      workspaceId,
    });
  }

  // Main method with caching (following user role pattern)
  async getRoleIdForApiKey(
    apiKeyId: string,
    workspaceId: string,
  ): Promise<string | null> {
    const apiKeyRoleMap =
      await this.workspacePermissionsCacheService.getApiKeyRoleMapFromCache({
        workspaceId,
      });

    return apiKeyRoleMap.data[apiKeyId] || null;
  }

  // Fallback method without caching (for edge cases)
  async getRoleForApiKey(
    apiKeyId: string,
    workspaceId: string,
  ): Promise<RoleEntity | null> {
    // Try to find explicit role assignment
    const roleTarget = await this.roleTargetsRepository.findOne({
      where: { apiKeyId, workspaceId },
      relations: ['role'],
    });

    if (roleTarget?.role) {
      return roleTarget.role;
    }

    // Fall back to workspace default role
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace?.defaultRoleId) {
      return null;
    }

    return await this.roleRepository.findOne({
      where: { id: workspace.defaultRoleId, workspaceId },
    });
  }

  // Trigger cache recomputation after role changes (following user role pattern)
  async recomputeCache(workspaceId: string): Promise<void> {
    await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache({
      workspaceId,
    });
  }

  private async validateAssignRoleInput({
    apiKeyId,
    workspaceId,
    roleId,
  }: {
    apiKeyId: string;
    workspaceId: string;
    roleId: string;
  }) {
    const apiKey = await this.apiKeyRepository.findOne({
      where: { id: apiKeyId, workspaceId },
    });

    if (!apiKey) {
      throw new ApiKeyException(
        `API Key with id ${apiKeyId} not found in workspace`,
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    const role = await this.roleRepository.findOne({
      where: { id: roleId, workspaceId },
    });

    if (!role) {
      throw new ApiKeyException(
        `Role with id ${roleId} not found in workspace`,
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    const existingRoleTarget = await this.roleTargetsRepository.findOne({
      where: {
        apiKeyId,
        roleId,
        workspaceId,
      },
    });

    return {
      roleToAssignIsSameAsCurrentRole: Boolean(existingRoleTarget),
    };
  }
}
