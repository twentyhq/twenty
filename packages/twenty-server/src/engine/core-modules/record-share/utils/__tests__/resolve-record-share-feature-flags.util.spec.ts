import { FeatureFlagKey } from 'twenty-shared/types';

import { resolveRecordShareFeatureFlags } from 'src/engine/core-modules/record-share/utils/resolve-record-share-feature-flags.util';

describe('resolveRecordShareFeatureFlags', () => {
  it('keeps visibility gating on for a workspace without flag rows', () => {
    expect(resolveRecordShareFeatureFlags({})).toEqual({
      isRecordShareVisibilityGatingEnabled: true,
      isRecordSharingEnabled: false,
    });
  });

  it('keeps record sharing when visibility gating is explicitly on', () => {
    expect(
      resolveRecordShareFeatureFlags({
        [FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED]: true,
        [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
      }),
    ).toEqual({
      isRecordShareVisibilityGatingEnabled: true,
      isRecordSharingEnabled: true,
    });
  });

  it('turns gating and record sharing off when the flag is explicitly false', () => {
    expect(
      resolveRecordShareFeatureFlags({
        [FeatureFlagKey.IS_RECORD_SHARE_VISIBILITY_GATING_ENABLED]: false,
        [FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED]: true,
      }),
    ).toEqual({
      isRecordShareVisibilityGatingEnabled: false,
      isRecordSharingEnabled: false,
    });
  });
});
