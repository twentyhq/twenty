import { type RulesLogic } from 'json-logic-js';

import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

describe('evaluateWidgetVisibility', () => {
  it('should return true (visible) when no conditionalDisplay is provided', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: undefined,
      context: {
        device: 'DESKTOP',
      },
    });

    expect(result).toBe(true);
  });

  it('should return true (visible) when condition evaluates to true for MOBILE device', () => {
    const conditionalDisplay: RulesLogic = {
      and: [
        {
          '===': [{ var: 'device' }, 'MOBILE'],
        },
      ],
    };

    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'MOBILE',
      },
    });

    expect(result).toBe(true);
  });

  it('should return false (hidden) when condition evaluates to false for DESKTOP device', () => {
    const conditionalDisplay: RulesLogic = {
      and: [
        {
          '===': [{ var: 'device' }, 'MOBILE'],
        },
      ],
    };

    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'DESKTOP',
      },
    });

    expect(result).toBe(false);
  });

  it('should return true (visible) when condition evaluates to true for DESKTOP device', () => {
    const conditionalDisplay: RulesLogic = {
      and: [
        {
          '===': [{ var: 'device' }, 'DESKTOP'],
        },
      ],
    };

    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'DESKTOP',
      },
    });

    expect(result).toBe(true);
  });

  it('should return false (hidden) when condition evaluates to false for MOBILE device', () => {
    const conditionalDisplay: RulesLogic = {
      and: [
        {
          '===': [{ var: 'device' }, 'DESKTOP'],
        },
      ],
    };

    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'MOBILE',
      },
    });

    expect(result).toBe(false);
  });

  it('should handle OR conditions', () => {
    const conditionalDisplay: RulesLogic = {
      or: [
        {
          '===': [{ var: 'device' }, 'MOBILE'],
        },
        {
          '===': [{ var: 'device' }, 'DESKTOP'],
        },
      ],
    };

    const resultMobile = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'MOBILE',
      },
    });

    const resultDesktop = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'DESKTOP',
      },
    });

    expect(resultMobile).toBe(true);
    expect(resultDesktop).toBe(true);
  });

  it('should throw error for invalid operator', () => {
    const invalidConditionalDisplay = {
      invalidOperator: 'test',
    } as unknown as RulesLogic;

    expect(() => {
      evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay: invalidConditionalDisplay,
        context: {
          device: 'DESKTOP',
        },
      });
    }).toThrow();
  });

  describe('conditionalAvailabilityExpression', () => {
    it('should return true when expression matches MOBILE device', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: undefined,
        context: {
          device: 'MOBILE',
        },
      });

      expect(result).toBe(true);
    });

    it('should return false when expression does not match MOBILE device', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay: undefined,
        context: {
          device: 'DESKTOP',
        },
      });

      expect(result).toBe(false);
    });

    it('should return true when expression matches DESKTOP device', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "DESKTOP"',
        conditionalDisplay: undefined,
        context: {
          device: 'DESKTOP',
        },
      });

      expect(result).toBe(true);
    });

    it('should take priority over conditionalDisplay when both are set', () => {
      const conditionalDisplay: RulesLogic = {
        and: [
          {
            '===': [{ var: 'device' }, 'DESKTOP'],
          },
        ],
      };

      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "MOBILE"',
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
        },
      });

      // Expression says MOBILE only, so DESKTOP should be hidden
      // even though conditionalDisplay says DESKTOP is visible
      expect(result).toBe(false);
    });

    it('should fall through to conditionalDisplay when expression is null', () => {
      const conditionalDisplay: RulesLogic = {
        and: [
          {
            '===': [{ var: 'device' }, 'MOBILE'],
          },
        ],
      };

      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: null,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
        },
      });

      // Expression is null, so conditionalDisplay takes over
      // conditionalDisplay says MOBILE only → DESKTOP hidden
      expect(result).toBe(false);
    });

    it('should fall through to conditionalDisplay when expression is undefined', () => {
      const conditionalDisplay: RulesLogic = {
        and: [
          {
            '===': [{ var: 'device' }, 'DESKTOP'],
          },
        ],
      };

      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
        },
      });

      expect(result).toBe(true);
    });
  });
});
