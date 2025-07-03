import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { CustomException } from 'src/utils/custom-exception';

describe('featureFlagValidator', () => {
  describe('assertIsFeatureFlagKey', () => {
    it('should not throw error if featureFlagKey is valid', () => {
      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(
          'IS_AI_ENABLED',
          new CustomException('Error', 'Error'),
        ),
      ).not.toThrow();
    });

    it('should not throw error for new workflow filtering feature flag', () => {
      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(
          'IS_WORKFLOW_FILTERING_ENABLED',
          new CustomException('Error', 'Error'),
        ),
      ).not.toThrow();
    });

    it('should throw error if featureFlagKey is invalid', () => {
      const invalidKey = 'InvalidKey';
      const exception = new CustomException('Error', 'Error');

      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(invalidKey, exception),
      ).toThrow(exception);
    });
  });
});
