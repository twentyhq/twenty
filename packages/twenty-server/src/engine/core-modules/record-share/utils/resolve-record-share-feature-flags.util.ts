/* @license Enterprise */

import { FeatureFlagKey } from 'twenty-shared/types';
import { isFeatureFlagEnabled } from 'twenty-shared/utils';

import { type RowAccessPolicyEnvironment } from 'src/engine/twenty-orm/types/row-access-policy.type';

export const resolveRecordShareFeatureFlags = (
  featureFlagsMap: Partial<Record<FeatureFlagKey, boolean>>,
): Pick<
  RowAccessPolicyEnvironment,
  'isRecordSharingEnabled' | 'isRecordShareVisibilityGatingEnabled'
> => {
  const isRecordShareVisibilityGatingEnabled = isFeatureFlagEnabled({
    featureFlagKey: FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED,
    value:
      featureFlagsMap[FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED],
  });

  // Share exceptions and records shared by name beyond the role are part of
  // the visibility gating, so turning it off turns them off too
  return {
    isRecordShareVisibilityGatingEnabled,
    isRecordSharingEnabled:
      isRecordShareVisibilityGatingEnabled &&
      isFeatureFlagEnabled({
        featureFlagKey: FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
        value: featureFlagsMap[FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED],
      }),
  };
};
