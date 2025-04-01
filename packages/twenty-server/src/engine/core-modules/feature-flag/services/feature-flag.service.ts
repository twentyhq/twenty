import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectRepository(FeatureFlag, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlag>,
  ) {}

  public async isFeatureEnabled(
    key: FeatureFlagKey,
    workspaceId: string,
  ): Promise<boolean> {
    const featureFlag = await this.featureFlagRepository.findOneBy({
      workspaceId,
      key,
      value: true,
    });

    return !!featureFlag?.value;
  }

  public async getWorkspaceFeatureFlags(
    workspaceId: string,
  ): Promise<FeatureFlag[]> {
    return this.featureFlagRepository.find({ where: { workspaceId } });
  }

  public async getWorkspaceFeatureFlagsMap(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags =
      await this.getWorkspaceFeatureFlags(workspaceId);

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }

  public async enableFeatureFlags(
    keys: FeatureFlagKey[],
    workspaceId: string,
  ): Promise<void> {
    await this.featureFlagRepository.upsert(
      keys.map((key) => ({ workspaceId, key, value: true })),
      {
        conflictPaths: ['workspaceId', 'key'],
        skipUpdateIfNoValuesChanged: true,
      },
    );
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

    const featureFlagKey = FeatureFlagKey[featureFlag];

    if (shouldBePublic) {
      publicFeatureFlagValidator.assertIsPublicFeatureFlag(
        featureFlagKey,
        new FeatureFlagException(
          'Invalid feature flag key, flag is not public',
          FeatureFlagExceptionCode.INVALID_FEATURE_FLAG_KEY,
        ),
      );
    }

    const existingFeatureFlag = await this.featureFlagRepository.findOne({
      where: {
        key: featureFlagKey,
        workspaceId: workspaceId,
      },
    });

    const featureFlagToSave = existingFeatureFlag
      ? {
          ...existingFeatureFlag,
          value,
        }
      : {
          key: featureFlagKey,
          value,
          workspaceId: workspaceId,
        };

    return await this.featureFlagRepository.save(featureFlagToSave);
  }
}
