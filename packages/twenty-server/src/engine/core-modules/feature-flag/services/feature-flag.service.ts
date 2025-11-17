import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FeatureFlagMap } from 'src/engine/core-modules/feature-flag/interfaces/feature-flag-map.interface';

import { type FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FlatFeatureFlag } from 'src/engine/core-modules/feature-flag/types/flat-feature-flag.type';
import { WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { computeFlatEntityMapsFromTo } from 'src/engine/metadata-modules/flat-entity/utils/compute-flat-entity-maps-from-to.util';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { WorkspaceMigrationBuilderExceptionV2 } from 'src/engine/workspace-manager/workspace-migration-v2/exceptions/workspace-migration-builder-exception-v2';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration-v2/services/workspace-migration-validate-build-and-run-service';

@Injectable()
export class FeatureFlagService {
  constructor(
    private readonly flatEntityMapsCacheService: WorkspaceManyOrAllFlatEntityMapsCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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
    const { flatFeatureFlagMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFeatureFlagMaps'],
        },
      );

    return Object.values(flatFeatureFlagMaps.byId).map((flatFeatureFlag) => ({
      key: flatFeatureFlag!.key,
      value: flatFeatureFlag!.value,
    }));
  }

  public async getWorkspaceFeatureFlagsMap(
    workspaceId: string,
  ): Promise<FeatureFlagMap> {
    const { flatFeatureFlagMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFeatureFlagMaps'],
        },
      );

    return Object.values(flatFeatureFlagMaps.byId).reduce<FeatureFlagMap>(
      (acc, flatFeatureFlag) => {
        if (flatFeatureFlag) {
          acc[flatFeatureFlag.key] = flatFeatureFlag.value;
        }

        return acc;
      },
      {} as FeatureFlagMap,
    );
  }

  public async enableFeatureFlags(
    keys: FeatureFlagKey[],
    workspaceId: string,
  ): Promise<void> {
    if (keys.length === 0) {
      return;
    }

    for (const key of keys) {
      await this.upsertWorkspaceFeatureFlag({
        workspaceId,
        featureFlag: key,
        value: true,
      });
    }
  }

  public async upsertWorkspaceFeatureFlag({
    workspaceId,
    featureFlag,
    value,
  }: {
    workspaceId: string;
    featureFlag: FeatureFlagKey;
    value: boolean;
  }): Promise<FlatFeatureFlag> {
    const { flatFeatureFlagMaps: existingFlatFeatureFlagMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFeatureFlagMaps'],
        },
      );

    const existingFeatureFlag = Object.values(
      existingFlatFeatureFlagMaps.byId,
    ).find((ff) => ff?.key === featureFlag && ff?.workspaceId === workspaceId);

    let flatFeatureFlagToCreate: FlatFeatureFlag | undefined;
    let flatFeatureFlagToUpdate: FlatFeatureFlag | undefined;

    if (existingFeatureFlag) {
      flatFeatureFlagToUpdate = {
        ...existingFeatureFlag,
        value,
      };
    } else {
      const now = new Date();

      flatFeatureFlagToCreate = {
        id: v4(),
        universalIdentifier: v4(),
        applicationId: null,
        key: featureFlag,
        value,
        workspaceId,
        createdAt: now,
        updatedAt: now,
      };
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          workspaceId,
          fromToAllFlatEntityMaps: {
            flatFeatureFlagMaps: computeFlatEntityMapsFromTo({
              flatEntityMaps: existingFlatFeatureFlagMaps,
              flatEntityToCreate: flatFeatureFlagToCreate
                ? [flatFeatureFlagToCreate]
                : [],
              flatEntityToDelete: [],
              flatEntityToUpdate: flatFeatureFlagToUpdate
                ? [flatFeatureFlagToUpdate]
                : [],
            }),
          },
          dependencyAllFlatEntityMaps: {},
          buildOptions: {
            isSystemBuild: false,
          },
        },
      );

    if (isDefined(validateAndBuildResult)) {
      throw new WorkspaceMigrationBuilderExceptionV2(
        validateAndBuildResult,
        'Multiple validation errors occurred while upserting feature flag',
      );
    }

    const { flatFeatureFlagMaps: recomputedFlatFeatureFlagMaps } =
      await this.flatEntityMapsCacheService.getOrRecomputeManyOrAllFlatEntityMaps(
        {
          workspaceId,
          flatMapsKeys: ['flatFeatureFlagMaps'],
        },
      );

    const featureFlagId = flatFeatureFlagToCreate
      ? flatFeatureFlagToCreate.id
      : existingFeatureFlag!.id;

    return findFlatEntityByIdInFlatEntityMapsOrThrow({
      flatEntityId: featureFlagId,
      flatEntityMaps: recomputedFlatFeatureFlagMaps,
    });
  }
}
