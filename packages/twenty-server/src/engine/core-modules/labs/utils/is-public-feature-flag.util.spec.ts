import { PUBLIC_FEATURE_FLAGS } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { isPublicFeatureFlag } from 'src/engine/core-modules/labs/utils/is-public-feature-flag.util';

describe('isPublicFeatureFlag', () => {
  it('should return true for public flags', () => {
    const publicFlag = PUBLIC_FEATURE_FLAGS[0];

    expect(isPublicFeatureFlag(publicFlag)).toBe(true);
  });

  it('should return false for non-public flags', () => {
    const nonPublicFlag = Object.values(FeatureFlagKey).find(
      (flag) => !PUBLIC_FEATURE_FLAGS.includes(flag as any),
    );

    expect(isPublicFeatureFlag(nonPublicFlag as FeatureFlagKey)).toBe(false);
  });

  it('should return false for undefined/null', () => {
    expect(isPublicFeatureFlag(undefined as any)).toBe(false);
    expect(isPublicFeatureFlag(null as any)).toBe(false);
  });
});
