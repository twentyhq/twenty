/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';

import { type RowAccessPolicyEnvironment } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const resolveRecordShareFeatureFlags = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): Pick<
  RowAccessPolicyEnvironment,
  'isRecordSharingEnabled' | 'isRecordShareVisibilityGatingEnabled'
> => {
  const isRecordShareVisibilityGatingEnabled =
    featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED] !==
    false;

  return {
    isRecordShareVisibilityGatingEnabled,
    isRecordSharingEnabled:
      isRecordShareVisibilityGatingEnabled &&
      (featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED] ??
        false),
  };
};
