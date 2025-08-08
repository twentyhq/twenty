import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import { type PublicFeatureFlag } from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { type FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';

jest.mock(
  'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum',
  () => ({
    FeatureFlagKey: {
      mockKey1: 'MOCK_KEY_1',
      mockKey2: 'MOCK_KEY_2',
    },
  }),
);

const mockPublicFeatureFlag = {
  key: 'MOCK_KEY_1',
  metadata: {
    label: 'Mock Label 1',
    description: 'Mock Description 1',
    imagePath: 'mock/path/1',
  },
};

jest.mock(
  'src/engine/core-modules/lab/utils/is-public-feature-flag.util',
  () => ({
    isPublicFeatureFlag: (
      key: FeatureFlagKey,
    ): key is PublicFeatureFlag['key'] => {
      if (!key) return false;

      return key === mockPublicFeatureFlag.key;
    },
  }),
);

// Note: We're using a single public flag for testing as it's sufficient to verify
// the validator's behavior. The validator's role is to check if a flag exists in
// the PUBLIC_FEATURE_FLAGS array, so testing with one flag adequately covers this
// functionality. Adding more flags wouldn't increase the test coverage meaningfully.

describe('publicFeatureFlagValidator', () => {
  describe('assertIsPublicFeatureFlag', () => {
    const mockException = new AuthException(
      'Not a public feature flag',
      AuthExceptionCode.INVALID_INPUT,
    );

    it('should not throw for public feature flags', () => {
      const publicFlag = mockPublicFeatureFlag.key as FeatureFlagKey;

      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          publicFlag,
          mockException,
        );
      }).not.toThrow();
    });

    it('should throw the provided exception for non-public feature flags', () => {
      const nonPublicFlag = 'MOCK_KEY_2' as FeatureFlagKey;

      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          nonPublicFlag,
          mockException,
        );
      }).toThrow(mockException);
    });

    it('should throw the provided exception for undefined key', () => {
      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          undefined as unknown as FeatureFlagKey,
          mockException,
        );
      }).toThrow(mockException);
    });

    it('should throw the provided exception for null key', () => {
      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          null as unknown as FeatureFlagKey,
          mockException,
        );
      }).toThrow(mockException);
    });

    it('should maintain type assertion after validation', () => {
      const publicFlag = mockPublicFeatureFlag;

      const testTypeAssertion = (flag: FeatureFlagKey) => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          flag,
          mockException,
        );

        return true;
      };

      expect(testTypeAssertion(publicFlag.key as FeatureFlagKey)).toBe(true);
    });
  });
});
