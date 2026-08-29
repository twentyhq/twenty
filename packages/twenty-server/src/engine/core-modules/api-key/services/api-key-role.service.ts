import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromFlatRoleToRoleDto } from 'src/engine/metadata-modules/role/utils/fromFlatRoleToRoleDto.util';
import {
  fromRoleEntitiesToRoleDtos,
  fromRoleEntityToRoleDto,
} from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApiKeyRoleService {
  constructor(
    @InjectWorkspaceScopedRepository(RoleTargetEntity)
    private readonly roleTargetRepository: WorkspaceScopedRepository<RoleTargetEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,

    @InjectWorkspaceScopedRepository(ApiKeyEntity)
    private readonly apiKeyRepository: WorkspaceScopedRepository<ApiKeyEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly roleTargetService: RoleTargetService,
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

    await this.roleTargetService.create({
      createRoleTargetInput: {
        roleId,
        targetId: apiKeyId,
        targetMetadataForeignKey: 'apiKeyId',
      },
      workspaceId,
    });
  }

  async getRoleIdForApiKeyId(
    apiKeyId: string,
    workspaceId: string,
  ): Promise<string> {
    const { apiKeyRoleMap } = await this.workspaceCacheService.getOrRecompute(
      workspaceId,
      ['apiKeyRoleMap'],
    );

    const roleId = apiKeyRoleMap[apiKeyId];

    if (!isDefined(roleId)) {
      throw new ApiKeyException(
        `API key ${apiKeyId} has no role assigned`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    return roleId;
  }

  async getRoleDtoByApiKeyId({
    apiKeyId,
    workspaceId,
  }: {
    apiKeyId: string;
    workspaceId: string;
  }): Promise<RoleDTO> {
    const { apiKeyRoleMap, flatRoleMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'apiKeyRoleMap',
        'flatRoleMaps',
      ]);

    const roleId = apiKeyRoleMap[apiKeyId];

    if (!isDefined(roleId)) {
      throw new ApiKeyException(
        `API key ${apiKeyId} has no role assigned`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    const flatRole = findFlatEntityByIdInFlatEntityMaps({
      flatEntityId: roleId,
      flatEntityMaps: flatRoleMaps,
    });

    if (!isDefined(flatRole)) {
      throw new ApiKeyException(
        `Role ${roleId} not found for API key ${apiKeyId}`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    return fromFlatRoleToRoleDto(flatRole);
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
    const apiKey = await this.apiKeyRepository.findOne(workspaceId, {
      where: { id: apiKeyId },
    });

    if (!apiKey) {
      throw new ApiKeyException(
        `API Key with id ${apiKeyId} not found in workspace`,
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    const role = await this.roleRepository.findOne(workspaceId, {
      where: { id: roleId },
    });

    if (!role) {
      throw new ApiKeyException(
        `Role with id ${roleId} not found in workspace`,
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    if (!role.canBeAssignedToApiKeys) {
      throw new ApiKeyException(
        `Role "${role.label}" cannot be assigned to API keys`,
        ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
      );
    }

    const existingRoleTarget = await this.roleTargetRepository.findOne(
      workspaceId,
      {
        where: {
          apiKeyId,
          roleId,
        },
      },
    );

    return {
      roleToAssignIsSameAsCurrentRole: Boolean(existingRoleTarget),
    };
  }

  public async getApiKeyAssignableRoles(
    workspaceId: string,
  ): Promise<RoleDTO[]> {
    const roles = await this.roleRepository.find(workspaceId, {
      where: { canBeAssignedToApiKeys: true },
      order: { label: 'ASC' },
    });

    return fromRoleEntitiesToRoleDtos(roles);
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

    const roleTargets = await this.roleTargetRepository.find(workspaceId, {
      where: {
        apiKeyId: In(apiKeyIds),
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

  public async getApiKeysAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<ApiKeyEntity[]> {
    const roleTargets = await this.roleTargetRepository.find(workspaceId, {
      where: {
        roleId,
        apiKeyId: Not(IsNull()),
      },
    });

    const apiKeyIds = roleTargets
      .map((roleTarget) => roleTarget.apiKeyId)
      .filter((apiKeyId): apiKeyId is string => apiKeyId !== null);

    if (!apiKeyIds.length) {
      return [];
    }

    const apiKeys = await this.apiKeyRepository.find(workspaceId, {
      where: { id: In(apiKeyIds), revokedAt: IsNull() },
    });

    return apiKeys;
  }
}
