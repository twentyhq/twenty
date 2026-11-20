import { type AdditionalOperation, type RulesLogic } from 'json-logic-js';

import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';
import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

describe('evaluateWidgetVisibility', () => {
  it('should return true (visible) when no conditionalDisplay is provided', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: undefined,
      context: {
        device: 'DESKTOP',
        selectedRecords: [],
        featureFlags: {},
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
        selectedRecords: [],
        featureFlags: {},
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
        selectedRecords: [],
        featureFlags: {},
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
        selectedRecords: [],
        featureFlags: {},
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
        selectedRecords: [],
        featureFlags: {},
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
        selectedRecords: [],
        featureFlags: {},
      },
    });

    const resultDesktop = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'DESKTOP',
        selectedRecords: [],
        featureFlags: {},
      },
    });

    expect(resultMobile).toBe(true);
    expect(resultDesktop).toBe(true);
  });

  it('should throw error for invalid operator', () => {
    const invalidConditionalDisplay: RulesLogic<AdditionalOperation> = {
      invalidOperator: 'test',
    };

    expect(() => {
      evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay: invalidConditionalDisplay,
        context: {
          device: 'DESKTOP',
          selectedRecords: [],
          featureFlags: {},
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
          selectedRecords: [],
          featureFlags: {},
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
          selectedRecords: [],
          featureFlags: {},
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
          selectedRecords: [],
          featureFlags: {},
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
          selectedRecords: [],
          featureFlags: {},
        },
      });

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
          selectedRecords: [],
          featureFlags: {},
        },
      });

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
          selectedRecords: [],
          featureFlags: {},
        },
      });

      expect(result).toBe(true);
    });
  });

  describe('conditionalAvailability', () => {
    const deviceIsMobile: ConditionalAvailabilityNode = {
      type: 'COMPARISON',
      operator: 'EQUAL',
      left: { type: 'VARIABLE', path: 'device' },
      right: { type: 'LITERAL', value: 'MOBILE' },
    };

    it.each([
      ['MOBILE', true],
      ['DESKTOP', false],
    ] as const)(
      'should evaluate the tree when no old rule is stored on %s',
      (device, expected) => {
        const result = evaluateWidgetVisibility({
          conditionalAvailabilityExpression: null,
          conditionalDisplay: undefined,
          conditionalAvailability: deviceIsMobile,
          context: { device, selectedRecords: [], featureFlags: {} },
        });

        expect(result).toBe(expected);
      },
    );

    it('should let a stored expression win over the tree', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: 'device == "DESKTOP"',
        conditionalDisplay: undefined,
        conditionalAvailability: deviceIsMobile,
        context: { device: 'DESKTOP', selectedRecords: [], featureFlags: {} },
      });

      expect(result).toBe(true);
    });

    it('should let a stored conditionalDisplay win over the tree', () => {
      const result = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: null,
        conditionalDisplay: { '===': [{ var: 'device' }, 'DESKTOP'] },
        conditionalAvailability: deviceIsMobile,
        context: { device: 'DESKTOP', selectedRecords: [], featureFlags: {} },
      });

      expect(result).toBe(true);
    });
  });
});
