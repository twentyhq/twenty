import { type RulesLogic } from 'json-logic-js';

import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

describe('evaluateWidgetVisibility', () => {
  it('should return true (visible) when no conditionalDisplay is provided', () => {
    const result = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay: undefined,
      context: {
        device: 'DESKTOP',
        selectedRecords: [],
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
      },
    });

    const resultDesktop = evaluateWidgetVisibility({
      conditionalAvailabilityExpression: undefined,
      conditionalDisplay,
      context: {
        device: 'DESKTOP',
        selectedRecords: [],
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
          selectedRecords: [],
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
          selectedRecords: [],
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
          selectedRecords: [],
        },
      });

      expect(result).toBe(true);
    });
  });

  describe('evaluating record in conditionalDisplay', () => {
    it('should evaluate conditionalDisplay rules referencing record properties on record pages', () => {
      const conditionalDisplay: RulesLogic = {
        '===': [{ var: 'record.profile' }, 'A'],
      };

      const matchingResult = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
          selectedRecords: [{ id: 'rec-1', profile: 'A' }],
          record: { id: 'rec-1', profile: 'A' },
        },
      });

      expect(matchingResult).toBe(true);

      const nonMatchingResult = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
          selectedRecords: [{ id: 'rec-2', profile: 'B' }],
          record: { id: 'rec-2', profile: 'B' },
        },
      });

      expect(nonMatchingResult).toBe(false);
    });

    it('should evaluate truthiness of record id when record is present', () => {
      const conditionalDisplay: RulesLogic = {
        '!!': [{ var: 'record.id' }],
      };

      const withRecordResult = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
          selectedRecords: [{ id: 'rec-1' }],
          record: { id: 'rec-1' },
        },
      });

      expect(withRecordResult).toBe(true);

      const withoutRecordResult = evaluateWidgetVisibility({
        conditionalAvailabilityExpression: undefined,
        conditionalDisplay,
        context: {
          device: 'DESKTOP',
          selectedRecords: [],
          record: undefined,
        },
      });

      expect(withoutRecordResult).toBe(false);
    });
  });
});
