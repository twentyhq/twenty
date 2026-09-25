import { isFeatureFlagOnlyAvailabilityExpression } from '@/page-layout/utils/isFeatureFlagOnlyAvailabilityExpression';

describe('isFeatureFlagOnlyAvailabilityExpression', () => {
  it.each([
    'featureFlags.IS_MESSAGES_TAB_ENABLED',
    'not featureFlags.IS_MESSAGES_TAB_ENABLED',
    'featureFlags.IS_MESSAGES_TAB_ENABLED and not featureFlags.IS_RECORD_SHARING_ENABLED',
  ])('should accept %s', (expression) => {
    expect(isFeatureFlagOnlyAvailabilityExpression(expression)).toBe(true);
  });

  it.each([
    'device == "MOBILE"',
    'device == "DESKTOP" and featureFlags.IS_MESSAGES_TAB_ENABLED',
    'true',
    'featureFlags.',
    '',
    null,
    undefined,
  ])('should reject %s', (expression) => {
    expect(isFeatureFlagOnlyAvailabilityExpression(expression)).toBe(false);
  });
});
