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

  /**
   * Creates a new API key in the core schema
   */
  async create(apiKeyData: Partial<ApiKey>): Promise<ApiKey> {
    const apiKey = this.apiKeyRepository.create(apiKeyData);

    return await this.apiKeyRepository.save(apiKey);
  }

  /**
   * Finds an API key by ID and workspace ID
   */
  async findById(id: string, workspaceId: string): Promise<ApiKey | null> {
    return await this.apiKeyRepository.findOne({
      where: {
        id,
        workspaceId,
      },
    });
  }

  /**
   * Finds all API keys for a workspace
   */
  async findByWorkspaceId(workspaceId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: {
        workspaceId,
      },
    });
  }

  /**
   * Finds all active (non-revoked) API keys for a workspace
   */
  async findActiveByWorkspaceId(workspaceId: string): Promise<ApiKey[]> {
    return await this.apiKeyRepository.find({
      where: {
        workspaceId,
        revokedAt: IsNull(),
      },
    });
  }

  /**
   * Updates an API key
   */
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

  /**
   * Revokes an API key (soft delete)
   */
  async revoke(id: string, workspaceId: string): Promise<ApiKey | null> {
    return await this.update(id, workspaceId, {
      revokedAt: new Date(),
    });
  }

  /**
   * Hard deletes an API key
   */
  async delete(id: string, workspaceId: string): Promise<ApiKey | null> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      return null;
    }

    await this.apiKeyRepository.softDelete(id);

    return apiKey;
  }

  /**
   * Validates an API key (checks if it exists and is not revoked)
   */
  async validateApiKey(id: string, workspaceId: string): Promise<ApiKey> {
    const apiKey = await this.findById(id, workspaceId);

    if (!apiKey) {
      throw new NotFoundException(`API Key with id ${id} not found`);
    }

    if (apiKey.revokedAt) {
      throw new Error('This API Key is revoked');
    }

    // Check if expired
    if (apiKey.expiresAt && new Date() > apiKey.expiresAt) {
      throw new Error('This API Key has expired');
    }

    return apiKey;
  }

  /**
   * Generates a JWT token for an API key
   */
  async generateApiKeyToken(
    workspaceId: string,
    apiKeyId?: string,
    expiresAt?: Date | string,
  ): Promise<Pick<ApiKeyToken, 'token'> | undefined> {
    if (!apiKeyId) {
      return;
    }

    // Validate that the API key exists and is active
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

  /**
   * Checks if an API key is expired
   */
  isExpired(apiKey: ApiKey): boolean {
    return apiKey.expiresAt && new Date() > apiKey.expiresAt;
  }

  /**
   * Checks if an API key is revoked
   */
  isRevoked(apiKey: ApiKey): boolean {
    return !!apiKey.revokedAt;
  }

  /**
   * Checks if an API key is active (not revoked and not expired)
   */
  isActive(apiKey: ApiKey): boolean {
    return !this.isRevoked(apiKey) && !this.isExpired(apiKey);
  }
}
