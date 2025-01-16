import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { isPublicFeatureFlag } from 'src/engine/core-modules/labs/utils/is-public-feature-flag.util';

describe('isPublicFeatureFlag', () => {
  it('should return true for public flags', () => {
    expect(isPublicFeatureFlag(FeatureFlagKey.IsCommandMenuV2Enabled)).toBe(
      true,
    );
  });

  it('should return false for non-public flags', () => {
    expect(isPublicFeatureFlag(FeatureFlagKey.IsWorkflowEnabled)).toBe(false);
  });

  it('should return false for undefined/null', () => {
    expect(isPublicFeatureFlag(undefined as any)).toBe(false);
    expect(isPublicFeatureFlag(null as any)).toBe(false);
  });
});
