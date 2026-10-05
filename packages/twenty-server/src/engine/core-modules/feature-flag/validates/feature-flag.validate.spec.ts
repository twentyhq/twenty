import { msg } from '@lingui/core/macro';

import { featureFlagValidator } from 'src/engine/core-modules/feature-flag/validates/feature-flag.validate';
import { UnknownException } from 'src/utils/custom-exception';

describe('featureFlagValidator', () => {
  describe('assertIsFeatureFlagKey', () => {
    it('should not throw error if featureFlagKey is valid', () => {
      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(
          'IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED',
          new UnknownException('Error', 'Error', {
            userFriendlyMessage: msg`Error`,
            category: 'INTERNAL_SERVER_ERROR',
          }),
        ),
      ).not.toThrow();
    });

    it('should throw error if featureFlagKey is invalid', () => {
      const invalidKey = 'InvalidKey';
      const exception = new UnknownException('Error', 'Error', {
        userFriendlyMessage: msg`Error`,
        category: 'INTERNAL_SERVER_ERROR',
      });

      expect(() =>
        featureFlagValidator.assertIsFeatureFlagKey(invalidKey, exception),
      ).toThrow(exception);
    });
  });
});
