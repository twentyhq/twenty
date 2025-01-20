import {
  AuthException,
  AuthExceptionCode,
} from 'src/engine/core-modules/auth/auth.exception';
import {
  PUBLIC_FEATURE_FLAGS,
  PublicFeatureFlag,
} from 'src/engine/core-modules/feature-flag/constants/public-feature-flag.const';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { publicFeatureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/is-public-feature-flag.validate';

describe('publicFeatureFlagValidator', () => {
  describe('assertIsPublicFeatureFlag', () => {
    const mockException = new AuthException(
      'Not a public feature flag',
      AuthExceptionCode.INVALID_INPUT,
    );

    it('should not throw for public feature flags', () => {
      const publicFlag = PUBLIC_FEATURE_FLAGS[0].key;

      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          publicFlag,
          mockException,
        );
      }).not.toThrow();
    });

    it('should throw the provided exception for non-public feature flags', () => {
      const nonPublicFlag = Object.values(FeatureFlagKey).find(
        (flag) => !PUBLIC_FEATURE_FLAGS.includes(flag as any),
      );

      expect(() => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          nonPublicFlag as FeatureFlagKey,
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
      const publicFlag = PUBLIC_FEATURE_FLAGS[0];

      const testTypeAssertion = (flag: FeatureFlagKey) => {
        publicFeatureFlagValidator.assertIsPublicFeatureFlag(
          flag,
          mockException,
        );
        const _test: PublicFeatureFlag['key'] = flag;

        return true;
      };

      expect(testTypeAssertion(publicFlag.key)).toBe(true);
    });
  });
});
