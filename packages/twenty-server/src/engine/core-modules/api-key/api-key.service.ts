import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { IsNull, Repository } from 'typeorm';

import { ApiKey } from 'src/engine/core-modules/api-key/api-key.entity';
import { ApiKeyToken } from 'src/engine/core-modules/auth/dto/token.entity';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

@Injectable()
export class ApiKeyService {
  constructor(
    @InjectRepository(ApiKey, 'core')
    private readonly apiKeyRepository: Repository<ApiKey>,
    private readonly jwtWrapperService: JwtWrapperService,
  ) {}

  async create(apiKeyData: Partial<ApiKey>): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create(apiKeyData);

    return await this.apiKeyRepository.save(apiKey);
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

  async delete(id: string, workspaceId: string): Promise<ApiKey | null> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      return null;
    }

    await this.apiKeyRepository.softDelete(id);

    return apiKey;
  }

  async validateApiKey(id: string, workspaceId: string): Promise<ApiKey> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      throw new NotFoundException(`API Key with id ${id} not found`);
    }

    if (apiKey.revokedAt) {
      throw new Error('This API Key is revoked');
    }

    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new Error('This API Key has expired');
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
    return apiKey.expiresAt ? new Date() > apiKey.expiresAt : false;
  }

  isRevoked(apiKey: ApiKey): boolean {
    return !!apiKey.revokedAt;
  }

  isActive(apiKey: ApiKey): boolean {
    return !this.isRevoked(apiKey) && !this.isExpired(apiKey);
  }
}
