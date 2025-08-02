import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { IsNull } from 'typeorm';

import { ApiKeyRoleService } from 'src/engine/core-modules/api-key/api-key-role.service';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/auth-context.type';
import { JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';

import { ApiKey } from './api-key.entity';
import { ApiKeyService } from './api-key.service';

describe('ApiKeyService', () => {
  let service: ApiKeyService;
  let mockApiKeyRepository: any;
  let mockRoleTargetsRepository: any;
  let mockJwtWrapperService: any;
  let mockApiKeyRoleService: any;
  let mockDataSource: any;

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

    mockRoleTargetsRepository = {
      delete: jest.fn(),
      save: jest.fn(),
      findOne: jest.fn(),
    };

    mockJwtWrapperService = {
      generateAppSecret: jest.fn(),
      sign: jest.fn(),
    };

    mockApiKeyRoleService = {
      recomputeCache: jest.fn(),
      assignRoleToApiKey: jest.fn(),
      assignRoleToApiKeyWithManager: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
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
        {
          provide: getRepositoryToken(RoleTargetsEntity, 'core'),
          useValue: mockRoleTargetsRepository,
        },
        {
          provide: ApiKeyRoleService,
          useValue: mockApiKeyRoleService,
        },
        {
          provide: getDataSourceToken('core'),
          useValue: mockDataSource,
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
    it('should create and save an API key using transaction', async () => {
      const apiKeyData = {
        name: 'New API Key',
        expiresAt: new Date('2025-12-31'),
        workspaceId: mockWorkspaceId,
        roleId: 'mock-role-id',
      };

      const expectedApiKeyFields = {
        name: 'New API Key',
        expiresAt: new Date('2025-12-31'),
        workspaceId: mockWorkspaceId,
      };

      mockApiKeyRoleService.assignRoleToApiKeyWithManager.mockResolvedValue(
        undefined,
      );
      mockApiKeyRoleService.recomputeCache.mockResolvedValue(undefined);

      const mockManagerCreate = jest.fn().mockReturnValue(mockApiKey);
      const mockManagerSave = jest.fn().mockResolvedValue(mockApiKey);

      mockDataSource.transaction.mockImplementation(
        async (callback: (manager: any) => Promise<any>) => {
          const mockManager = {
            create: mockManagerCreate,
            save: mockManagerSave,
          };

          return await callback(mockManager);
        },
      );

      const result = await service.create(apiKeyData);

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManagerCreate).toHaveBeenCalledWith(
        ApiKey,
        expectedApiKeyFields,
      );
      expect(mockManagerSave).toHaveBeenCalledWith(mockApiKey);
      expect(
        mockApiKeyRoleService.assignRoleToApiKeyWithManager,
      ).toHaveBeenCalledWith(
        expect.any(Object), // manager
        {
          apiKeyId: mockApiKey.id,
          roleId: 'mock-role-id',
          workspaceId: mockWorkspaceId,
        },
      );
      expect(mockApiKeyRoleService.recomputeCache).toHaveBeenCalledWith(
        mockWorkspaceId,
      );
      expect(result).toEqual(mockApiKey);
    });

    it('should handle role assignment failures within transaction', async () => {
      const apiKeyData = {
        name: 'New API Key',
        expiresAt: new Date('2025-12-31'),
        workspaceId: mockWorkspaceId,
        roleId: 'mock-role-id',
      };

      const mockManagerCreate = jest.fn().mockReturnValue(mockApiKey);
      const mockManagerSave = jest.fn().mockResolvedValue(mockApiKey);

      mockApiKeyRoleService.assignRoleToApiKeyWithManager.mockRejectedValue(
        new Error('Role assignment failed'),
      );

      mockDataSource.transaction.mockImplementation(
        async (callback: (manager: any) => Promise<any>) => {
          const mockManager = {
            create: mockManagerCreate,
            save: mockManagerSave,
          };

          return await callback(mockManager);
        },
      );

      await expect(service.create(apiKeyData)).rejects.toThrow(
        'Role assignment failed',
      );

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(mockManagerCreate).toHaveBeenCalled();
      expect(mockManagerSave).toHaveBeenCalled();
      expect(
        mockApiKeyRoleService.assignRoleToApiKeyWithManager,
      ).toHaveBeenCalled();
      expect(mockApiKeyRoleService.recomputeCache).not.toHaveBeenCalled();
    });

    it('should handle transaction failures gracefully', async () => {
      const apiKeyData = {
        name: 'New API Key',
        expiresAt: new Date('2025-12-31'),
        workspaceId: mockWorkspaceId,
        roleId: 'mock-role-id',
      };

      mockDataSource.transaction.mockRejectedValue(
        new Error('Transaction failed'),
      );

      await expect(service.create(apiKeyData)).rejects.toThrow(
        'Transaction failed',
      );

      expect(mockDataSource.transaction).toHaveBeenCalled();
      expect(
        mockApiKeyRoleService.assignRoleToApiKeyWithManager,
      ).not.toHaveBeenCalled();
      expect(mockApiKeyRoleService.recomputeCache).not.toHaveBeenCalled();
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

    it('should use custom expiration time if provided', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      const expiresAt = new Date(Date.now() + 3600000); // 1 hour from now

      await service.generateApiKeyToken(
        mockWorkspaceId,
        mockApiKeyId,
        expiresAt,
      );

      expect(mockJwtWrapperService.sign).toHaveBeenCalledWith(
        {
          sub: mockWorkspaceId,
          type: JwtTokenTypeEnum.API_KEY,
          workspaceId: mockWorkspaceId,
        },
        expect.objectContaining({
          secret: mockSecret,
          expiresIn: expect.any(Number),
          jwtid: mockApiKeyId,
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
