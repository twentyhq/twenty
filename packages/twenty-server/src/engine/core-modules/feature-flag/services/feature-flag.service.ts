import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { Repository } from 'typeorm';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag.dto';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { NodeEnvironment } from 'src/engine/core-modules/twenty-config/interfaces/node-environment.interface';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { DEFAULT_FEATURE_FLAGS } from 'src/engine/workspace-manager/workspace-migration/constant/default-feature-flags';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly twentyConfigService: TwentyConfigService,
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
    const workspaceFeatureFlagsMap = await this.getWorkspaceFeatureFlagsMap(
      workspaceId,
    );

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

    if (this.twentyConfigService.get('NODE_ENV') !== NodeEnvironment.DEVELOPMENT) {
      return workspaceFeatureFlagsMap;
    }

    const defaultEnabledFeatureFlags = Object.fromEntries(
      DEFAULT_FEATURE_FLAGS.map((featureFlag) => [featureFlag, true]),
    );

    return {
      ...workspaceFeatureFlagsMap,
      ...defaultEnabledFeatureFlags,
    } as FeatureFlagMap;
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
