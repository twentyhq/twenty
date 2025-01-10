import { CustomException } from 'src/utils/custom-exception';
import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';

describe('featureFlagValidator', () => {
  describe('assertIsFeatureFlagKey', () => {
    it('should not throw error if featureFlagKey is valid', () => {
      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(
          'IsWorkflowEnabled',
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
