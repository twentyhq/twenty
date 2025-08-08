import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';

import { isPublicFeatureFlag } from './is-public-feature-flag.util';

jest.mock(
  'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum',
  () => ({
    FeatureFlagKey: {
      mockKey1: 'MOCK_KEY_1',
      mockKey2: 'MOCK_KEY_2',
    },
  }),
);

jest.mock(
  'src/engine/core-modules/feature-flag/constants/public-feature-flag.const',
  () => ({
    PUBLIC_FEATURE_FLAGS: [
      {
        key: 'MOCK_KEY_1',
        metadata: {
          label: 'Mock Label 1',
          description: 'Mock Description 1',
          imagePath: 'mock/path/1',
        },
      },
    ],
  }),
);

describe('isPublicFeatureFlag', () => {
  it('should return true for public flags', () => {
    const publicFlag = 'MOCK_KEY_1';

    expect(isPublicFeatureFlag(publicFlag as FeatureFlagKey)).toBe(true);
  });

  it('should return false for non-public flags', () => {
    const nonPublicFlag = 'MOCK_KEY_2';

    expect(isPublicFeatureFlag(nonPublicFlag as FeatureFlagKey)).toBe(false);
  });

  it('should return false for undefined/null', () => {
    expect(isPublicFeatureFlag(undefined as any)).toBe(false);
    expect(isPublicFeatureFlag(null as any)).toBe(false);
  });
});
