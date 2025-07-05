import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { IsNull } from 'typeorm';

import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';

import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let mockApiKeyRepository: any;
  let mockJwtWrapperService: any;

  const mockWorkspaceId = 'workspace-123';
  const mockApiKeyId = 'api-key-456';

  const mockApiKey: ApiKey = {
    id: mockApiKeyId,
    name: 'Test API Key',
    expiresAt: new Date('2025-12-31'),
    revokedAt: undefined,
    workspaceId: mockWorkspaceId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    workspace: {} as any,
  };

  const mockRevokedApiKey: ApiKey = {
    ...mockApiKey,
    id: 'revoked-api-key',
    revokedAt: new Date('2024-06-01'),
  };

  const mockExpiredApiKey: ApiKey = {
    ...mockApiKey,
    id: 'expired-api-key',
    expiresAt: new Date('2024-01-01'),
  };

  beforeEach(async () => {
    mockApiKeyRepository = {
      create: jest.fn(),
      save: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
    };

    mockJwtWrapperService = {
      generateAppSecret: jest.fn(),
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyService,
        {
          provide: getRepositoryToken(ApiKey, 'core'),
          useValue: mockApiKeyRepository,
        },
        {
          provide: JwtWrapperService,
          useValue: mockJwtWrapperService,
        },
      ],
    }).compile();

    service = module.get<ApiKeyService>(ApiKeyService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save an API key', async () => {
      const apiKeyData = {
        name: 'New API Key',
        expiresAt: new Date('2025-12-31'),
        workspaceId: mockWorkspaceId,
      };

      mockApiKeyRepository.create.mockReturnValue(mockApiKey);
      mockApiKeyRepository.save.mockResolvedValue(mockApiKey);

      const result = await service.create(apiKeyData);

      expect(mockApiKeyRepository.create).toHaveBeenCalledWith(apiKeyData);
      expect(mockApiKeyRepository.save).toHaveBeenCalledWith(mockApiKey);
      expect(result).toEqual(mockApiKey);
    });
  });

  describe('findById', () => {
    it('should find an API key by ID and workspace ID', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.findById(mockApiKeyId, mockWorkspaceId);

      expect(mockApiKeyRepository.findOne).toHaveBeenCalledWith({
        where: {
          id: mockApiKeyId,
          workspaceId: mockWorkspaceId,
        },
      });
      expect(result).toEqual(mockApiKey);
    });

    it('should return null if API key not found', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      const result = await service.findById('non-existent', mockWorkspaceId);

      expect(result).toBeNull();
    });
  });

  describe('findByWorkspaceId', () => {
    it('should find all API keys for a workspace', async () => {
      const mockApiKeys = [mockApiKey, { ...mockApiKey, id: 'another-key' }];

      mockApiKeyRepository.find.mockResolvedValue(mockApiKeys);

      const result = await service.findByWorkspaceId(mockWorkspaceId);

      expect(mockApiKeyRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId: mockWorkspaceId,
        },
      });
      expect(result).toEqual(mockApiKeys);
    });
  });

  describe('findActiveByWorkspaceId', () => {
    it('should find only active (non-revoked) API keys', async () => {
      const activeApiKeys = [mockApiKey];

      mockApiKeyRepository.find.mockResolvedValue(activeApiKeys);

      const result = await service.findActiveByWorkspaceId(mockWorkspaceId);

      expect(mockApiKeyRepository.find).toHaveBeenCalledWith({
        where: {
          workspaceId: mockWorkspaceId,
          revokedAt: IsNull(),
        },
      });
      expect(result).toEqual(activeApiKeys);
    });
  });

  describe('update', () => {
    it('should update an existing API key', async () => {
      const updateData = { name: 'Updated API Key' };
      const updatedApiKey = { ...mockApiKey, ...updateData };

      mockApiKeyRepository.findOne
        .mockResolvedValueOnce(mockApiKey)
        .mockResolvedValueOnce(updatedApiKey);
      mockApiKeyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.update(
        mockApiKeyId,
        mockWorkspaceId,
        updateData,
      );

      expect(mockApiKeyRepository.update).toHaveBeenCalledWith(
        mockApiKeyId,
        updateData,
      );
      expect(result).toEqual(updatedApiKey);
    });

    it('should return null if API key to update does not exist', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      const result = await service.update('non-existent', mockWorkspaceId, {
        name: 'Updated',
      });

      expect(mockApiKeyRepository.update).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('revoke', () => {
    it('should revoke an API key by setting revokedAt', async () => {
      const revokedApiKey = { ...mockApiKey, revokedAt: new Date() };

      mockApiKeyRepository.findOne
        .mockResolvedValueOnce(mockApiKey)
        .mockResolvedValueOnce(revokedApiKey);
      mockApiKeyRepository.update.mockResolvedValue({ affected: 1 });

      const result = await service.revoke(mockApiKeyId, mockWorkspaceId);

      expect(mockApiKeyRepository.update).toHaveBeenCalledWith(
        mockApiKeyId,
        expect.objectContaining({
          revokedAt: expect.any(Date),
        }),
      );
      expect(result).toEqual(revokedApiKey);
    });
  });

  describe('validateApiKey', () => {
    it('should validate an active API key', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      const result = await service.validateApiKey(
        mockApiKeyId,
        mockWorkspaceId,
      );

      expect(result).toEqual(mockApiKey);
    });

    it('should throw ApiKeyException if API key does not exist', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.validateApiKey('non-existent', mockWorkspaceId),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.validateApiKey('non-existent', mockWorkspaceId),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      });
    });

    it('should throw ApiKeyException if API key is revoked', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockRevokedApiKey);

      await expect(
        service.validateApiKey(mockRevokedApiKey.id, mockWorkspaceId),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.validateApiKey(mockRevokedApiKey.id, mockWorkspaceId),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_REVOKED,
      });
    });

    it('should throw ApiKeyException if API key is expired', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockExpiredApiKey);

      await expect(
        service.validateApiKey(mockExpiredApiKey.id, mockWorkspaceId),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.validateApiKey(mockExpiredApiKey.id, mockWorkspaceId),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_EXPIRED,
      });
    });
  });

  describe('generateApiKeyToken', () => {
    const mockSecret = 'mock-secret';
    const mockToken = 'mock-jwt-token';

    beforeEach(() => {
      mockJwtWrapperService.generateAppSecret.mockReturnValue(mockSecret);
      mockJwtWrapperService.sign.mockReturnValue(mockToken);
    });

    it('should generate a JWT token for a valid API key', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      const expiresAt = new Date('2025-12-31');

      const result = await service.generateApiKeyToken(
        mockWorkspaceId,
        mockApiKeyId,
        expiresAt,
      );

      expect(mockJwtWrapperService.generateAppSecret).toHaveBeenCalledWith(
        JwtTokenTypeEnum.ACCESS,
        mockWorkspaceId,
      );
      expect(mockJwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: mockWorkspaceId,
          type: JwtTokenTypeEnum.API_KEY,
          workspaceId: mockWorkspaceId,
        },
        {
          secret: mockSecret,
          expiresIn: expect.any(Number),
          jwtid: mockApiKeyId,
        },
      );
      expect(result).toEqual({ token: mockToken });
    });

    it('should return undefined if no API key ID provided', async () => {
      const result = await service.generateApiKeyToken(mockWorkspaceId);

      expect(result).toBeUndefined();
      expect(mockJwtWrapperService.generateAppSecret).not.toHaveBeenCalled();
    });

    it('should use default expiration if no expiresAt provided', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);

      await service.generateApiKeyToken(mockWorkspaceId, mockApiKeyId);

      expect(mockJwtWrapperService.sign).toHaveBeenCalledWith(
        expect.any(Object),
        expect.objectContaining({
          expiresIn: '100y',
        }),
      );
    });
  });

  describe('utility methods', () => {
    describe('isExpired', () => {
      it('should return true for expired API key', () => {
        const result = service.isExpired(mockExpiredApiKey);

        expect(result).toBe(true);
      });

      it('should return false for non-expired API key', () => {
        const result = service.isExpired(mockApiKey);

        expect(result).toBe(false);
      });
    });

    describe('isRevoked', () => {
      it('should return true for revoked API key', () => {
        const result = service.isRevoked(mockRevokedApiKey);

        expect(result).toBe(true);
      });

      it('should return false for non-revoked API key', () => {
        const result = service.isRevoked(mockApiKey);

        expect(result).toBe(false);
      });
    });

    describe('isActive', () => {
      it('should return true for active API key', () => {
        const result = service.isActive(mockApiKey);

        expect(result).toBe(true);
      });

      it('should return false for revoked API key', () => {
        const result = service.isActive(mockRevokedApiKey);

        expect(result).toBe(false);
      });

      it('should return false for expired API key', () => {
        const result = service.isActive(mockExpiredApiKey);

        expect(result).toBe(false);
      });
    });
  });
});
