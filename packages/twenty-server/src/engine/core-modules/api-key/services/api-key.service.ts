import { Injectable } from '@nestjs/common';

import { msg } from '@lingui/core/macro';
import { IsNull } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { type ApiKeyToken } from 'src/engine/core-modules/auth/dto/api-key-token.dto';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_ROLE } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-role.constant';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectWorkspaceScopedRepository(ApiKeyEntity)
    private readonly apiKeyRepository: WorkspaceScopedRepository<ApiKeyEntity>,
    @InjectWorkspaceScopedRepository(RoleEntity)
    private readonly roleRepository: WorkspaceScopedRepository<RoleEntity>,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly roleTargetService: RoleTargetService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {}

  async create(
    apiKeyData: Partial<ApiKeyEntity> & { roleId: string; workspaceId: string },
  ): Promise<ApiKeyEntity> {
    const { roleId, workspaceId, ...apiKeyFields } = apiKeyData;
    const savedApiKey = await this.apiKeyRepository.save(
      workspaceId,
      apiKeyFields,
    );

    try {
      await this.roleTargetService.create({
        createRoleTargetInput: {
          roleId,
          targetId: savedApiKey.id,
          targetMetadataForeignKey: 'apiKeyId',
        },
        workspaceId: savedApiKey.workspaceId,
      });
    } catch (error) {
      await this.apiKeyRepository.delete(workspaceId, { id: savedApiKey.id });
      throw error;
    }

    await this.invalidateApiKeyCache(savedApiKey.workspaceId);

    return savedApiKey;
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ApiKeyEntity | null> {
    return this.apiKeyRepository.findOne(workspaceId, {
      where: { id },
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.find(workspaceId);
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.find(workspaceId, {
      where: { revokedAt: IsNull() },
    });
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: QueryDeepPartialEntity<ApiKeyEntity>,
  ): Promise<ApiKeyEntity | null> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      return null;
    }

    await this.apiKeyRepository.update(workspaceId, { id }, updateData);
    await this.invalidateApiKeyCache(workspaceId);

    return this.findById(id, workspaceId);
  }

  async revoke(id: string, workspaceId: string): Promise<ApiKeyEntity | null> {
    return this.update(id, workspaceId, { revokedAt: new Date() });
  }

  async validateApiKey(id: string, workspaceId: string): Promise<ApiKeyEntity> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      throw new ApiKeyException(
        `API Key with id ${id} not found`,
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    if (apiKey.revokedAt) {
      throw new ApiKeyException(
        'This API Key is revoked',
        ApiKeyExceptionCode.API_KEY_REVOKED,
        {
          userFriendlyMessage: msg`This API Key has been revoked and can no longer be used.`,
        },
      );
    }

    if (new Date() > apiKey.expiresAt) {
      throw new ApiKeyException(
        'This API Key has expired',
        ApiKeyExceptionCode.API_KEY_EXPIRED,
        {
          userFriendlyMessage: msg`This API Key has expired. Please create a new one.`,
        },
      );
    }

    return apiKey;
  }

  async generateApiKeyToken(
    workspaceId: string,
    apiKeyId?: string,
    expiresAt?: Date | string,
  ): Promise<Pick<ApiKeyToken, 'token'> | undefined> {
    if (!apiKeyId) {
      return;
    }

    await this.validateApiKey(apiKeyId, workspaceId);

    let expiresIn: string | number;

    if (expiresAt) {
      expiresIn = Math.floor(
        (new Date(expiresAt).getTime() - new Date().getTime()) / 1000,
      );
    } else {
      expiresIn = '100y';
    }

    const token = await this.jwtWrapperService.signAsyncOrThrow(
      {
        sub: workspaceId,
        type: JwtTokenTypeEnum.API_KEY,
        workspaceId,
      },
      {
        expiresIn,
        jwtid: apiKeyId,
      },
    );

    return { token };
  }

  async createWorkspaceAdminApiKeyToken(input: {
    workspaceId: string;
    name: string;
    expiresAt?: Date | string;
  }): Promise<{ apiKeyId: string; token: string }> {
    const expiresAt = input.expiresAt
      ? new Date(input.expiresAt)
      : new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000);
    const adminRole = await this.roleRepository.findOne(input.workspaceId, {
      where: {
        universalIdentifier: STANDARD_ROLE.admin.universalIdentifier,
      },
    });

    if (!adminRole) {
      throw new ApiKeyException(
        `No Admin role found for workspace ${input.workspaceId}`,
        ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      );
    }

    const apiKey = await this.create({
      name: input.name,
      expiresAt,
      workspaceId: input.workspaceId,
      roleId: adminRole.id,
    });
    const token = await this.generateApiKeyToken(
      input.workspaceId,
      apiKey.id,
      expiresAt,
    );

    if (!token) {
      throw new ApiKeyException(
        'Failed to generate API key token',
        ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      );
    }

    return { apiKeyId: apiKey.id, token: token.token };
  }

  isExpired(apiKey: ApiKeyEntity): boolean {
    return new Date() > apiKey.expiresAt;
  }

  isRevoked(apiKey: ApiKeyEntity): boolean {
    return !!apiKey.revokedAt;
  }

  isActive(apiKey: ApiKeyEntity): boolean {
    return !this.isRevoked(apiKey) && !this.isExpired(apiKey);
  }

  private async invalidateApiKeyCache(workspaceId: string): Promise<void> {
    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'apiKeyMap',
      'apiKeyRoleMap',
    ]);
  }
}
