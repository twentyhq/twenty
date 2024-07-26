import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import { FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';

@Injectable()
export class FeatureFlagFactory {
  constructor(
    @InjectRepository(FeatureFlagEntity, 'core')
    private readonly featureFlagRepository: Repository<FeatureFlagEntity>,
  ) {}

  async create(workspaceId: string): Promise<FeatureFlagMap> {
    const workspaceFeatureFlags = await this.featureFlagRepository.find({
      where: { workspaceId },
    });

    const workspaceFeatureFlagsMap = workspaceFeatureFlags.reduce(
      (result, currentFeatureFlag) => {
        result[currentFeatureFlag.key] = currentFeatureFlag.value;

        return result;
      },
      {} as FeatureFlagMap,
    );

    return workspaceFeatureFlagsMap;
  }
}
