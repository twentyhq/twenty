import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

jest.mock(
  'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate',
);
jest.mock(
  'src/engine/core-modules/feature-flag/validates/feature-flag.validate',
);

describe('FeatureFlagService', () => {
  let service: FeatureFlagService;

  const mockFeatureFlagRepository = {
    findOneBy: jest.fn(),
    find: jest.fn(),
    upsert: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockWorkspaceFeatureFlagsMapCacheService = {
    getWorkspaceFeatureFlagsMap: jest.fn(),
    recomputeFeatureFlagsMapCache: jest.fn(),
  };

  const mockWorkspacePermissionsCacheService = {
    recomputeRolesPermissionsCache: jest.fn(),
  };

  const workspaceId = 'workspace-id';
  const featureFlag = FeatureFlagKey.IS_AI_ENABLED;

  beforeEach(async () => {
    jest.clearAllMocks();

    (
      publicFeatureFlagValidator.assertIsPublicFeatureFlag as jest.Mock
    ).mockReset();
    (featureFlagValidator.assertIsFeatureFlagKey as jest.Mock).mockReset();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeatureFlagService,
        {
          provide: getRepositoryToken(FeatureFlag, 'core'),
          useValue: mockFeatureFlagRepository,
        },
        {
          provide: WorkspaceFeatureFlagsMapCacheService,
          useValue: mockWorkspaceFeatureFlagsMapCacheService,
        },
        {
          provide: WorkspacePermissionsCacheService,
          useValue: mockWorkspacePermissionsCacheService,
        },
      ],
    }).compile();

    service = module.get<FeatureFlagService>(FeatureFlagService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('isFeatureEnabled', () => {
    it('should return true when feature flag is enabled', async () => {
      // Prepare
      mockWorkspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap.mockResolvedValue(
        {
          [featureFlag]: true,
        },
      );

      // Act
      const result = await service.isFeatureEnabled(featureFlag, workspaceId);

      // Assert
      expect(result).toBe(true);
      expect(
        mockWorkspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap,
      ).toHaveBeenCalledWith({
        workspaceId,
      });
    });

    it('should return false when feature flag is not found', async () => {
      // Prepare
      mockWorkspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap.mockResolvedValue(
        {},
      );

      // Act
      const result = await service.isFeatureEnabled(featureFlag, workspaceId);

      // Assert
      expect(result).toBe(false);
    });

    it('should return false when feature flag value is false', async () => {
      // Prepare
      mockFeatureFlagRepository.findOneBy.mockResolvedValue({
        key: featureFlag,
        value: false,
      });

      // Act
      const result = await service.isFeatureEnabled(featureFlag, workspaceId);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('getWorkspaceFeatureFlags', () => {
    it('should return all feature flags for a workspace', async () => {
      // Prepare
      mockWorkspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap.mockResolvedValue(
        {
          [FeatureFlagKey.IS_AI_ENABLED]: false,
        },
      );
      const mockFeatureFlags = [
        { key: FeatureFlagKey.IS_AI_ENABLED, value: false },
      ];

      // Act
      const result = await service.getWorkspaceFeatureFlags(workspaceId);

      // Assert
      expect(result).toEqual(mockFeatureFlags);
      expect(
        mockWorkspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap,
      ).toHaveBeenCalledWith({ workspaceId });
    });
  });

  describe('getWorkspaceFeatureFlagsMap', () => {
    it('should return a map of feature flags for a workspace', async () => {
      // Prepare
      const mockFeatureFlags = [
        { key: FeatureFlagKey.IS_AI_ENABLED, value: false, workspaceId },
      ];

      mockFeatureFlagRepository.find.mockResolvedValue(mockFeatureFlags);

      // Act
      const result = await service.getWorkspaceFeatureFlagsMap(workspaceId);

      // Assert
      expect(result).toEqual({
        [FeatureFlagKey.IS_AI_ENABLED]: false,
      });
    });
  });

  describe('enableFeatureFlags', () => {
    it('should enable multiple feature flags for a workspace', async () => {
      // Prepare
      const keys = [FeatureFlagKey.IS_AI_ENABLED];

      mockFeatureFlagRepository.upsert.mockResolvedValue({});

      // Act
      await service.enableFeatureFlags(keys, workspaceId);

      // Assert
      expect(mockFeatureFlagRepository.upsert).toHaveBeenCalledWith(
        keys.map((key) => ({ workspaceId, key, value: true })),
        {
          conflictPaths: ['workspaceId', 'key'],
          skipUpdateIfNoValuesChanged: true,
        },
      );
    });
  });

  describe('upsertWorkspaceFeatureFlag', () => {
    it('should upsert a feature flag for a workspace', async () => {
      // Prepare
      const value = true;
      const mockFeatureFlag = {
        key: featureFlag,
        value,
        workspaceId,
      };

      mockFeatureFlagRepository.save.mockResolvedValue(mockFeatureFlag);

      (
        featureFlagValidator.assertIsFeatureFlagKey as jest.Mock
      ).mockImplementation(() => true);

      // Act
      const result = await service.upsertWorkspaceFeatureFlag({
        workspaceId,
        featureFlag,
        value,
      });

      // Assert
      expect(result).toEqual(mockFeatureFlag);
      expect(mockFeatureFlagRepository.save).toHaveBeenCalledWith({
        key: FeatureFlagKey[featureFlag],
        value,
        workspaceId,
      });
    });

    it('should throw an exception when feature flag key is invalid', async () => {
      // Prepare
      const invalidFeatureFlag = 'INVALID_KEY' as FeatureFlagKey;
      const value = true;

      (
        featureFlagValidator.assertIsFeatureFlagKey as jest.Mock
      ).mockImplementation(() => {
        throw new FeatureFlagException(
          'Invalid feature flag key',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        );
      });

      // Act & Assert
      await expect(
        service.upsertWorkspaceFeatureFlag({
          workspaceId,
          featureFlag: invalidFeatureFlag,
          value,
        }),
      ).rejects.toThrow(
        new FeatureFlagException(
          'Invalid feature flag key',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        ),
      );
    });

    it('should throw an exception when non-public feature flag is used with shouldBePublic=true', async () => {
      // Prepare
      (
        publicFeatureFlagValidator.assertIsPublicFeatureFlag as jest.Mock
      ).mockImplementation(() => {
        throw new FeatureFlagException(
          'Invalid feature flag key, flag is not public',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        );
      });

      // Act & Assert
      await expect(
        service.upsertWorkspaceFeatureFlag({
          workspaceId,
          featureFlag,
          value: true,
          shouldBePublic: true,
        }),
      ).rejects.toThrow(
        new FeatureFlagException(
          'Invalid feature flag key, flag is not public',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        ),
      );
    });
  });
});
