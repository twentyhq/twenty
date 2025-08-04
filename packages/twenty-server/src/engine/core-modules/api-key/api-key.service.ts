import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { DataSource, IsNull, Repository } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { ApiKeyToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly apiKeyRoleService: ApiKeyRoleService,
    @InjectDataSource('core')
    private readonly dataSource: DataSource,
  ) {}

  async create(
    apiKeyData: Partial<ApiKey> & { roleId: string },
  ): Promise<ApiKey> {
    const { roleId, ...apiKeyFields } = apiKeyData;

    return await this.dataSource
      .transaction(async (manager) => {
        const apiKey = manager.create(ApiKey, apiKeyFields);
        const savedApiKey = await manager.save(apiKey);

        await this.apiKeyRoleService.assignRoleToApiKeyWithManager(manager, {
          apiKeyId: savedApiKey.id,
          roleId,
          workspaceId: savedApiKey.workspaceId,
        });

        return savedApiKey;
      })
      .then(async (savedApiKey) => {
        await this.apiKeyRoleService.recomputeCache(savedApiKey.workspaceId);

        return savedApiKey;
      });
  }

  async findById(id: string, workspaceId: string): Promise<ApiKey | null> {
    return await this.apiKeyRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: {
        workspaceId,
      },
    });
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: {
        workspaceId,
        revokedAt: IsNull(),
      },
    });
  }

  async update(
    id: string,
    workspaceId: string,
    updateData: Partial<ApiKey>,
  ): Promise<ApiKey | null> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      return null;
    }

    await this.apiKeyRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async revoke(id: string, workspaceId: string): Promise<ApiKey | null> {
    return await this.update(id, workspaceId, {
      revokedAt: new Date(),
    });
  }

  async validateApiKey(id: string, workspaceId: string): Promise<ApiKey> {
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
          userFriendlyMessage:
            'This API Key has been revoked and can no longer be used.',
        },
      );
    }

    if (new Date() > apiKey.expiresAt) {
      throw new ApiKeyException(
        'This API Key has expired',
        ApiKeyExceptionCode.API_KEY_EXPIRED,
        {
          userFriendlyMessage:
            'This API Key has expired. Please create a new one.',
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

    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.ACCESS,
      workspaceId,
    );

    let expiresIn: string | number;

    if (expiresAt) {
      expiresIn = Math.floor(
        (new Date(expiresAt).getTime() - new Date().getTime()) / 1000,
      );
    } else {
      expiresIn = '100y';
    }

    const token = this.jwtWrapperService.sign(
      {
        sub: workspaceId,
        type: JwtTokenTypeEnum.API_KEY,
        workspaceId,
      },
      {
        secret,
        expiresIn,
        jwtid: apiKeyId,
      },
    );

    return { token };
  }

  isExpired(apiKey: ApiKey): boolean {
    return new Date() > apiKey.expiresAt;
  }

  isRevoked(apiKey: ApiKey): boolean {
    return !!apiKey.revokedAt;
  }

  isActive(apiKey: ApiKey): boolean {
    return !this.isRevoked(apiKey) && !this.isExpired(apiKey);
  }
}
