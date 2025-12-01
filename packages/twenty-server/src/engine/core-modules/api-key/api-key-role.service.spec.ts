import { Test, type TestingModule } from '@nestjs/testing';
import { getDataSourceToken, getRepositoryToken } from '@nestjs/typeorm';

import { In } from 'typeorm';

import { ApiKeyEntity } from 'src/engine/core-modules/api-key/api-key.entity';
import {
  ApiKeyException,
  ApiKeyExceptionCode,
} from 'src/engine/core-modules/api-key/api-key.exception';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { RoleTargetService } from 'src/engine/metadata-modules/role-target/services/role-target.service';
import { RoleTargetsEntity } from 'src/engine/metadata-modules/role/role-targets.entity';
import { RoleEntity } from 'src/engine/metadata-modules/role/role.entity';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

import { ApiKeyRoleService } from './api-key-role.service';

describe('ApiKeyRoleService', () => {
  let service: ApiKeyRoleService;
  let mockRoleTargetsRepository: any;
  let mockRoleRepository: any;
  let mockWorkspaceRepository: any;
  let mockApiKeyRepository: any;
  let mockDataSource: any;
  let mockWorkspacePermissionsCacheService: any;
  let mockRoleTargetService: any;

  const mockWorkspaceId = 'workspace-123';
  const mockApiKeyId = 'api-key-456';
  const mockRoleId = 'role-789';
  const mockNewRoleId = 'role-999';

  const mockApiKey: ApiKeyEntity = {
    id: mockApiKeyId,
    name: 'Test API Key',
    expiresAt: new Date('2025-12-31'),
    revokedAt: undefined,
    workspaceId: mockWorkspaceId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    workspace: {} as any,
  };

  const mockRole: Partial<RoleEntity> = {
    id: mockRoleId,
    label: 'Admin',
    icon: 'admin-icon',
    description: 'Admin role',
    isEditable: true,
    workspaceId: mockWorkspaceId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    canUpdateAllSettings: true,
    canAccessAllTools: true,
    canReadAllObjectRecords: true,
    canUpdateAllObjectRecords: true,
    canSoftDeleteAllObjectRecords: true,
    canDestroyAllObjectRecords: true,
    canBeAssignedToAgents: false,
    canBeAssignedToUsers: true,
    canBeAssignedToApiKeys: true,
  };

  const mockNewRole: Partial<RoleEntity> = {
    ...mockRole,
    id: mockNewRoleId,
    label: 'Member',
  };

  const mockRoleTarget = {
    id: 'role-target-123',
    roleId: mockRoleId,
    apiKeyId: mockApiKeyId,
    workspaceId: mockWorkspaceId,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    role: mockRole,
    apiKey: mockApiKey,
  } as RoleTargetsEntity;

  beforeEach(async () => {
    mockRoleTargetsRepository = {
      save: jest.fn(),
      delete: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    mockRoleRepository = {
      findOne: jest.fn(),
    };

    mockWorkspaceRepository = {
      findOne: jest.fn(),
    };

    mockApiKeyRepository = {
      findOne: jest.fn(),
    };

    mockDataSource = {
      transaction: jest.fn(),
    };

    mockWorkspacePermissionsCacheService = {
      recomputeApiKeyRoleMapCache: jest.fn(),
      getApiKeyRoleMapFromCache: jest.fn(),
    };

    mockRoleTargetService = {
      create: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApiKeyRoleService,
        {
          provide: getRepositoryToken(RoleTargetsEntity),
          useValue: mockRoleTargetsRepository,
        },
        {
          provide: getRepositoryToken(RoleEntity),
          useValue: mockRoleRepository,
        },
        {
          provide: getRepositoryToken(WorkspaceEntity),
          useValue: mockWorkspaceRepository,
        },
        {
          provide: getRepositoryToken(ApiKeyEntity),
          useValue: mockApiKeyRepository,
        },
        {
          provide: getDataSourceToken(),
          useValue: mockDataSource,
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: mockWorkspacePermissionsCacheService,
        },
        {
          provide: RoleTargetService,
          useValue: mockRoleTargetService,
        },
      ],
    }).compile();

    service = module.get<ApiKeyRoleService>(ApiKeyRoleService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('assignRoleToApiKey', () => {
    it('should assign a new role to API key using roleTargetService', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(mockNewRole);
      mockRoleTargetsRepository.findOne.mockResolvedValue(null);
      mockRoleTargetService.create.mockResolvedValue(undefined);

      await service.assignRoleToApiKey({
        apiKeyId: mockApiKeyId,
        roleId: mockNewRoleId,
        workspaceId: mockWorkspaceId,
      });

      expect(mockRoleTargetService.create).toHaveBeenCalledWith({
        createRoleTargetInput: {
          roleId: mockNewRoleId,
          targetId: mockApiKeyId,
          targetMetadataForeignKey: 'apiKeyId',
        },
        workspaceId: mockWorkspaceId,
      });
    });

    it('should skip assignment if role is already assigned', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleTargetsRepository.findOne.mockResolvedValue(mockRoleTarget);

      await service.assignRoleToApiKey({
        apiKeyId: mockApiKeyId,
        roleId: mockRoleId,
        workspaceId: mockWorkspaceId,
      });

      expect(mockRoleTargetService.create).not.toHaveBeenCalled();
    });

    it('should throw exception if API key not found', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: 'non-existent',
          roleId: mockRoleId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: 'non-existent',
          roleId: mockRoleId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      });
    });

    it('should throw exception if role not found', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: mockApiKeyId,
          roleId: 'non-existent-role',
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: mockApiKeyId,
          roleId: 'non-existent-role',
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_NOT_FOUND,
      });
    });
  });

  describe('getRoleIdForApiKey', () => {
    it('should return role ID from cache', async () => {
      const mockCacheData = {
        data: {
          [mockApiKeyId]: mockRoleId,
        },
      };

      mockWorkspacePermissionsCacheService.getApiKeyRoleMapFromCache.mockResolvedValue(
        mockCacheData,
      );

      const result = await service.getRoleIdForApiKey(
        mockApiKeyId,
        mockWorkspaceId,
      );

      expect(
        mockWorkspacePermissionsCacheService.getApiKeyRoleMapFromCache,
      ).toHaveBeenCalledWith({
        workspaceId: mockWorkspaceId,
      });
      expect(result).toBe(mockRoleId);
    });

    it('should throw exception if API key has no role in cache', async () => {
      const mockCacheData = {
        data: {},
      };

      mockWorkspacePermissionsCacheService.getApiKeyRoleMapFromCache.mockResolvedValue(
        mockCacheData,
      );

      await expect(
        service.getRoleIdForApiKey(mockApiKeyId, mockWorkspaceId),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.getRoleIdForApiKey(mockApiKeyId, mockWorkspaceId),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.API_KEY_NO_ROLE_ASSIGNED,
      });
    });
  });

  describe('getRolesByApiKeys', () => {
    it('should return empty map for empty API key IDs', async () => {
      const result = await service.getRolesByApiKeys({
        apiKeyIds: [],
        workspaceId: mockWorkspaceId,
      });

      expect(result).toEqual(new Map());
      expect(mockRoleTargetsRepository.find).not.toHaveBeenCalled();
    });

    it('should return roles map for given API key IDs', async () => {
      const mockApiKeyIds = [mockApiKeyId, 'another-api-key'];
      const mockRoleTargets = [
        {
          apiKeyId: mockApiKeyId,
          role: mockRole,
        },
        {
          apiKeyId: 'another-api-key',
          role: mockNewRole,
        },
      ];

      mockRoleTargetsRepository.find.mockResolvedValue(mockRoleTargets);

      const result = await service.getRolesByApiKeys({
        apiKeyIds: mockApiKeyIds,
        workspaceId: mockWorkspaceId,
      });

      expect(mockRoleTargetsRepository.find).toHaveBeenCalledWith({
        where: {
          apiKeyId: In(mockApiKeyIds),
          workspaceId: mockWorkspaceId,
        },
        relations: ['role'],
      });

      expect(result.size).toBe(2);
      expect(result.get(mockApiKeyId)).toEqual({
        id: mockRole.id,
        label: mockRole.label,
        icon: mockRole.icon,
        description: mockRole.description,
        isEditable: mockRole.isEditable,
        roleTargets: mockRole.roleTargets,
        canUpdateAllSettings: true,
        canAccessAllTools: true,
        canReadAllObjectRecords: true,
        canUpdateAllObjectRecords: true,
        canSoftDeleteAllObjectRecords: true,
        canDestroyAllObjectRecords: true,
        canBeAssignedToAgents: false,
        canBeAssignedToUsers: true,
        canBeAssignedToApiKeys: true,
        standardId: undefined,
      });
    });

    it('should handle role targets with missing apiKeyId or role gracefully', async () => {
      const mockRoleTargets = [
        {
          apiKeyId: null,
          role: mockRole,
        },
        {
          apiKeyId: mockApiKeyId,
          role: null,
        },
        {
          apiKeyId: 'valid-api-key',
          role: mockRole,
        },
      ];

      mockRoleTargetsRepository.find.mockResolvedValue(mockRoleTargets);

      const result = await service.getRolesByApiKeys({
        apiKeyIds: [mockApiKeyId, 'valid-api-key'],
        workspaceId: mockWorkspaceId,
      });

      expect(result.size).toBe(1);
      expect(result.has('valid-api-key')).toBe(true);
    });
  });

  describe('validateAssignRoleInput', () => {
    it('should validate successful role assignment inputs', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(mockNewRole);
      mockRoleTargetsRepository.findOne.mockResolvedValue(null);

      const validateMethod = (service as any).validateAssignRoleInput;
      const result = await validateMethod.call(service, {
        apiKeyId: mockApiKeyId,
        workspaceId: mockWorkspaceId,
        roleId: mockNewRoleId,
      });

      expect(result.roleToAssignIsSameAsCurrentRole).toBe(false);
    });

    it('should detect same role assignment', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(mockRole);
      mockRoleTargetsRepository.findOne.mockResolvedValue(mockRoleTarget);

      const validateMethod = (service as any).validateAssignRoleInput;
      const result = await validateMethod.call(service, {
        apiKeyId: mockApiKeyId,
        workspaceId: mockWorkspaceId,
        roleId: mockRoleId,
      });

      expect(result.roleToAssignIsSameAsCurrentRole).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle roleTargetService failures gracefully', async () => {
      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(mockNewRole);
      mockRoleTargetsRepository.findOne.mockResolvedValue(null);

      mockRoleTargetService.create.mockRejectedValue(
        new Error('Role target creation failed'),
      );

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: mockApiKeyId,
          roleId: mockNewRoleId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow('Role target creation failed');
    });

    it('should throw exception if role cannot be assigned to API keys', async () => {
      const roleNotForApiKeys = {
        ...mockNewRole,
        canBeAssignedToApiKeys: false,
      };

      mockApiKeyRepository.findOne.mockResolvedValue(mockApiKey);
      mockRoleRepository.findOne.mockResolvedValue(roleNotForApiKeys);
      mockRoleTargetsRepository.findOne.mockResolvedValue(null);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: mockApiKeyId,
          roleId: mockNewRoleId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toThrow(ApiKeyException);

      await expect(
        service.assignRoleToApiKey({
          apiKeyId: mockApiKeyId,
          roleId: mockNewRoleId,
          workspaceId: mockWorkspaceId,
        }),
      ).rejects.toMatchObject({
        code: ApiKeyExceptionCode.ROLE_CANNOT_BE_ASSIGNED_TO_API_KEYS,
      });
    });
  });
});
