import { Injectable } from '@nestjs/common';

import { FeatureFlagKey } from 'twenty-shared/types';

import { FEATURE_FLAG_DISABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-disabled-event.constant';
import { FEATURE_FLAG_ENABLED_EVENT } from 'src/engine/core-modules/feature-flag/constants/feature-flag-enabled-event.constant';
import { type FeatureFlagEnabledEvent } from 'src/engine/core-modules/feature-flag/types/feature-flag-enabled-event.type';
import { WorkspaceEventEmitter } from 'src/engine/workspace-event-emitter/workspace-event-emitter';
import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag.dto';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import {
  FeatureFlagException,
  FeatureFlagExceptionCode,
} from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';
import { InjectWorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/inject-workspace-scoped-repository.decorator';
import { WorkspaceScopedRepository } from 'src/engine/twenty-orm/workspace-scoped-repository/workspace-scoped-repository';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@Injectable()
export class FeatureFlagService {
  constructor(
    @InjectWorkspaceScopedRepository(FeatureFlagEntity)
    private readonly featureFlagRepository: WorkspaceScopedRepository<FeatureFlagEntity>,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceEventEmitter: WorkspaceEventEmitter,
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
        workspaceId,
        keys.map((key) => ({ key, value: true })),
        {
          conflictPaths: ['workspaceId', 'key'],
          skipUpdateIfNoValuesChanged: true,
        },
      );

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'featureFlagsMap',
      ]);

      this.emitFeatureFlagsEnabled({ keys, workspaceId });
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

    const existingFeatureFlag = await this.featureFlagRepository.findOne(
      workspaceId,
      { where: { key: featureFlag } },
    );

    if (existingFeatureFlag?.value === value) {
      return existingFeatureFlag;
    }

    const result = await this.featureFlagRepository.upsertAndReturnOne(
      workspaceId,
      { key: featureFlag, value },
      ['workspaceId', 'key'],
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'featureFlagsMap',
    ]);

    this.workspaceEventEmitter.emitCustomBatchEvent<FeatureFlagEnabledEvent>(
      value ? FEATURE_FLAG_ENABLED_EVENT : FEATURE_FLAG_DISABLED_EVENT,
      [{ key: featureFlag }],
      workspaceId,
    );

    return result;
  }

  private emitFeatureFlagsEnabled({
    keys,
    workspaceId,
  }: {
    keys: FeatureFlagKey[];
    workspaceId: string;
  }): void {
    this.workspaceEventEmitter.emitCustomBatchEvent<FeatureFlagEnabledEvent>(
      FEATURE_FLAG_ENABLED_EVENT,
      keys.map((key) => ({ key })),
      workspaceId,
    );
  }
}
