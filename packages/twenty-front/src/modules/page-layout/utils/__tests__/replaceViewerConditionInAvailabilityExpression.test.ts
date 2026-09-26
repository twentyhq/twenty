import { replaceViewerConditionInAvailabilityExpression } from '@/page-layout/utils/replaceViewerConditionInAvailabilityExpression';
import { splitAvailabilityExpression } from '@/page-layout/utils/splitAvailabilityExpression';

describe('replaceViewerConditionInAvailabilityExpression', () => {
  const FLAG_CONDITION = 'not featureFlags.IS_MESSAGES_TAB_ENABLED';

  it('should keep the feature flag condition next to a new viewer condition', () => {
    const expression = replaceViewerConditionInAvailabilityExpression({
      expression: FLAG_CONDITION,
      viewerCondition: 'device == "DESKTOP"',
    });

    expect(expression).toBe(
      '(not featureFlags.IS_MESSAGES_TAB_ENABLED) and (device == "DESKTOP")',
    );
    expect(splitAvailabilityExpression(expression)).toEqual({
      featureFlagCondition: FLAG_CONDITION,
      viewerCondition: 'device == "DESKTOP"',
    });
  });

  it('should fall back to the feature flag condition when the viewer condition is cleared', () => {
    expect(
      replaceViewerConditionInAvailabilityExpression({
        expression: `(${FLAG_CONDITION}) and (device == "MOBILE")`,
        viewerCondition: null,
      }),
    ).toBe(FLAG_CONDITION);
  });

  it('should replace an expression carrying no feature flag condition', () => {
    expect(
      replaceViewerConditionInAvailabilityExpression({
        expression: 'device == "MOBILE"',
        viewerCondition: 'device == "DESKTOP"',
      }),
    ).toBe('device == "DESKTOP"');
    expect(
      replaceViewerConditionInAvailabilityExpression({
        expression: null,
        viewerCondition: null,
      }),
    ).toBeNull();
  });
});
