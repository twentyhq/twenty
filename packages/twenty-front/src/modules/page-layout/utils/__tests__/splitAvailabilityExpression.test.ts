import { splitAvailabilityExpression } from '@/page-layout/utils/splitAvailabilityExpression';

describe('splitAvailabilityExpression', () => {
  it('should read an expression on feature flags alone as a flag condition', () => {
    expect(
      splitAvailabilityExpression('not featureFlags.IS_MESSAGES_TAB_ENABLED'),
    ).toEqual({
      featureFlagCondition: 'not featureFlags.IS_MESSAGES_TAB_ENABLED',
      viewerCondition: null,
    });
  });

  it('should read any other expression as a viewer condition', () => {
    expect(splitAvailabilityExpression('device == "MOBILE"')).toEqual({
      featureFlagCondition: null,
      viewerCondition: 'device == "MOBILE"',
    });
    expect(
      splitAvailabilityExpression(
        'device == "MOBILE" and featureFlags.IS_MESSAGES_TAB_ENABLED',
      ),
    ).toEqual({
      featureFlagCondition: null,
      viewerCondition:
        'device == "MOBILE" and featureFlags.IS_MESSAGES_TAB_ENABLED',
    });
  });

  it('should separate a flag condition joined to a viewer condition', () => {
    expect(
      splitAvailabilityExpression(
        '(featureFlags.IS_MESSAGES_TAB_ENABLED) and (device == "DESKTOP")',
      ),
    ).toEqual({
      featureFlagCondition: 'featureFlags.IS_MESSAGES_TAB_ENABLED',
      viewerCondition: 'device == "DESKTOP"',
    });
  });

  it('should return no condition for an empty expression', () => {
    expect(splitAvailabilityExpression(null)).toEqual({
      featureFlagCondition: null,
      viewerCondition: null,
    });
    expect(splitAvailabilityExpression('')).toEqual({
      featureFlagCondition: null,
      viewerCondition: null,
    });
  });
});
