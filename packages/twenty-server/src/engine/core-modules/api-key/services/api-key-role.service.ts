import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { RoleTargetEntity } from 'src/engine/metadata-modules/role-target/role-target.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { type RoleDTO } from 'src/engine/metadata-modules/role/dtos/role.dto';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { fromRoleEntityToRoleDto } from 'src/engine/metadata-modules/role/utils/fromRoleEntityToRoleDto.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class ApiKeyRoleService {
  constructor(
    @InjectRepository(RoleTargetEntity)
    private readonly roleTargetRepository: Repository<RoleTargetEntity>,
    @InjectRepository(RoleEntity)
    private readonly roleRepository: Repository<RoleEntity>,

    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
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

    if (!role.canBeAssignedToApiKeys) {
      throw new ApiKeyException(
        `Role "${role.label}" cannot be assigned to API keys`,
        ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
      );
    }

    const existingRoleTarget = await this.roleTargetRepository.findOne({
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

    const roleTargets = await this.roleTargetRepository.find({
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

  public async getApiKeysAssignedToRole(
    roleId: string,
    workspaceId: string,
  ): Promise<ApiKeyEntity[]> {
    const roleTargets = await this.roleTargetRepository.find({
      where: {
        roleId,
        workspaceId,
        apiKeyId: Not(IsNull()),
      },
    });

    const apiKeyIds = roleTargets
      .map((roleTarget) => roleTarget.apiKeyId)
      .filter((apiKeyId): apiKeyId is string => apiKeyId !== null);

    if (!apiKeyIds.length) {
      return [];
    }

    const apiKeys = await this.apiKeyRepository.find({
      where: {
        id: In(apiKeyIds),
        workspaceId,
        revokedAt: IsNull(),
      },
    });

    return apiKeys;
  }
}
