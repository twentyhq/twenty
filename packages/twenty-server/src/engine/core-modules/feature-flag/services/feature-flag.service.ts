import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { WorkspaceFeatureFlagsMapCacheService } from 'src/engine/metadata-modules/workspace-feature-flags-map-cache/workspace-feature-flags-map-cache.service';
import { WorkspacePermissionsCacheService } from 'src/engine/metadata-modules/workspace-permissions-cache/workspace-permissions-cache.service';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
    private readonly workspaceFeatureFlagsMapCacheService: WorkspaceFeatureFlagsMapCacheService,
    private readonly workspacePermissionsCacheService: WorkspacePermissionsCacheService,
  ) {}

  public async isFeatureEnabled(
    key: FeatureFlagKey,
    workspaceId: string,
  ): Promise<boolean> {
    const featureFlagMap = await this.getWorkspaceFeatureFlagsMap(workspaceId);

    return !!featureFlagMap[key];
  }

  public async getWorkspaceFeatureFlags(
    workspaceId: string,
  ): Promise<FeatureFlagDTO[]> {
    const workspaceFeatureFlagsMap =
      await this.workspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap(
        { workspaceId },
      );

    return Object.entries(workspaceFeatureFlagsMap).map(([key, value]) => ({
      key: key as FeatureFlagKey,
      value,
    }));
  }

  public async getWorkspaceFeatureFlagsMap(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const workspaceFeatureFlagsMap =
      await this.workspaceFeatureFlagsMapCacheService.getWorkspaceFeatureFlagsMap(
        { workspaceId },
      );

    return workspaceFeatureFlagsMap;
  }

  public async enableFeatureFlags(
    keys: FeatureFlagKey[],
    workspaceId: string,
  ): Promise<void> {
    if (keys.length > 0) {
      await this.featureFlagRepository.upsert(
        keys.map((key) => ({ workspaceId, key, value: true })),
        {
          conflictPaths: ['workspaceId', 'key'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

      await this.workspaceFeatureFlagsMapCacheService.recomputeFeatureFlagsMapCache(
        { workspaceId },
      );
    }
  }

  public async upsertWorkspaceFeatureFlag({
    workspaceId,
    featureFlag,
    value,
    shouldBePublic = false,
  }: {
    workspaceId: string;
    featureFlag: FeatureFlagKey;
    value: boolean;
    shouldBePublic?: boolean;
  }): Promise<FeatureFlag> {
    featureFlagValidator.assertIsFeatureFlagKey(
      featureFlag,
      new FeatureFlagException(
        'Invalid feature flag key',
        FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
      ),
    );

    if (shouldBePublic) {
      publicFeatureFlagValidator.assertIsPublicFeatureFlag(
        featureFlag,
        new FeatureFlagException(
          'Invalid feature flag key, flag is not public',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        ),
      );
    }

    const existingFeatureFlag = await this.featureFlagRepository.findOne({
      where: {
        key: featureFlag,
        workspaceId: workspaceId,
      },
    });

    const featureFlagToSave = existingFeatureFlag
      ? {
          ...existingFeatureFlag,
          value,
        }
      : {
          key: featureFlag,
          value,
          workspaceId: workspaceId,
        };

    const result = await this.featureFlagRepository.save(featureFlagToSave);

    await this.workspaceFeatureFlagsMapCacheService.recomputeFeatureFlagsMapCache(
      { workspaceId },
    );

    return result;
  }
}
