import { type FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { type FlatFeatureFlag } from 'src/engine/core-modules/feature-flag/types/flat-feature-flag.type';

export const fromFeatureFlagEntityToFlatFeatureFlag = (
  featureFlagEntity: FeatureFlagEntity,
): FlatFeatureFlag => {
  return {
    id: featureFlagEntity.id,
    universalIdentifier:
      featureFlagEntity.universalIdentifier ?? featureFlagEntity.id,
    applicationId: featureFlagEntity.applicationId ?? null,
    key: featureFlagEntity.key,
    value: featureFlagEntity.value,
    workspaceId: featureFlagEntity.workspaceId,
    createdAt: featureFlagEntity.createdAt,
    updatedAt: featureFlagEntity.updatedAt,
  };
};
