import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { msg } from '@lingui/core/macro';
import { IsNull, Repository } from 'typeorm';
import { type QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/exceptions/api-key.exception';
import { type ApiKeyToken } from 'src/engine/core-modules/auth/dto/api-key-token.dto';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
    private readonly jwtWrapperService: JwtWrapperService,
    private readonly roleTargetService: RoleTargetService,
  ) {}

  async create(
    apiKeyData: Partial<ApiKeyEntity> & { roleId: string },
  ): Promise<ApiKeyEntity> {
    const { roleId, ...apiKeyFields } = apiKeyData;
    const savedApiKey = await this.apiKeyRepository.save(apiKeyFields);

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
      await this.apiKeyRepository.delete(savedApiKey.id);
      throw error;
    }

    return savedApiKey;
  }

  async findById(
    id: string,
    workspaceId: string,
  ): Promise<ApiKeyEntity | null> {
    return await this.apiKeyRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });
  }

  async findByWorkspaceId(workspaceId: string): Promise<ApiKeyEntity[]> {
    return await this.apiKeyRepository.find({
      where: {
        workspaceId,
      },
    });
  }

  async findActiveByWorkspaceId(workspaceId: string): Promise<ApiKeyEntity[]> {
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
    updateData: QueryDeepPartialEntity<ApiKeyEntity>,
  ): Promise<ApiKeyEntity | null> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      return null;
    }

    await this.apiKeyRepository.update(id, updateData);

    return this.findById(id, workspaceId);
  }

  async revoke(id: string, workspaceId: string): Promise<ApiKeyEntity | null> {
    return await this.update(id, workspaceId, {
      revokedAt: new Date(),
    });
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

    const secret = this.jwtWrapperService.generateAppSecret(
      JwtTokenTypeEnum.API_KEY,
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

  isExpired(apiKey: ApiKeyEntity): boolean {
    return new Date() > apiKey.expiresAt;
  }

  isRevoked(apiKey: ApiKeyEntity): boolean {
    return !!apiKey.revokedAt;
  }

  isActive(apiKey: ApiKeyEntity): boolean {
    return !this.isRevoked(apiKey) && !this.isExpired(apiKey);
  }
}
