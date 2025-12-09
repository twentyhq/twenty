import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
    const { featureFlagsMap: workspaceFeatureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
      ]);

    return Object.entries(workspaceFeatureFlagsMap).map(([key, value]) => ({
      key: key as FeatureFlagKey,
      value,
    }));
  }

  public async getWorkspaceFeatureFlagsMap(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const { featureFlagsMap: workspaceFeatureFlagsMap } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'featureFlagsMap',
      ]);

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

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'featureFlagsMap',
      ]);
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
  }): Promise<FeatureFlagEntity> {
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

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'featureFlagsMap',
    ]);

    return result;
  }
}
