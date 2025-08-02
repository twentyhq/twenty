import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, EntityManager, In, Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
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
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {}

  public async assignRoleToApiKey({
    apiKeyId,
    roleId,
    workspaceId,
  }: {
    apiKeyId: string;
    roleId: string;
    workspaceId: string;
  }): Promise<void> {
    const validationResult = await this.validateAssignRoleInput({
      apiKeyId,
      workspaceId,
      roleId,
    });

    if (validationResult?.roleToAssignIsSameAsCurrentRole) {
      return;
    }

    await this.dataSource.transaction(async (manager) => {
      await this.assignRoleToApiKeyWithManager(manager, {
        apiKeyId,
        roleId,
        workspaceId,
      });
    });

    await this.workspacePermissionsCacheService.recomputeApiKeyRoleMapCache({
      workspaceId,
    });
  }

  public async assignRoleToApiKeyWithManager(
    manager: EntityManager,
    {
      apiKeyId,
      roleId,
      workspaceId,
    }: {
      apiKeyId: string;
      roleId: string;
      workspaceId: string;
    },
  ): Promise<void> {
    await manager.delete(RoleTargetsEntity, {
      apiKeyId,
      workspaceId,
    });

    const roleTarget = manager.create(RoleTargetsEntity, {
      apiKeyId,
      roleId,
      workspaceId,
    });

    await manager.save(roleTarget);
  }

  async getRoleIdForApiKey(
    apiKeyId: string,
    workspaceId: string,
  ): Promise<string> {
    const apiKeyRoleMap =
      await this.workspacePermissionsCacheService.getApiKeyRoleMapFromCache({
        workspaceId,
      });

    const roleId = apiKeyRoleMap.data[apiKeyId];

    if (!roleId) {
      throw new ApiKeyException(
        `API key ${apiKeyId} has no role assigned`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    return roleId;
  }

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

  public async getRolesByApiKeys({
    apiKeyIds,
    workspaceId,
  }: {
    apiKeyIds: string[];
    workspaceId: string;
  }): Promise<Map<string, RoleDTO>> {
    if (!apiKeyIds.length) {
      return new Map();
    }

    const roleTargets = await this.roleTargetsRepository.find({
      where: {
        apiKeyId: In(apiKeyIds),
        workspaceId,
      },
      relations: ['role'],
    });

    const rolesMap = new Map<string, RoleDTO>();

    for (const roleTarget of roleTargets) {
      if (roleTarget.apiKeyId && roleTarget.role) {
        rolesMap.set(
          roleTarget.apiKeyId,
          fromRoleEntityToRoleDto(roleTarget.role),
        );
      }
    }

    return rolesMap;
  }
}
