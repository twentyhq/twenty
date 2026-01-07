import { type RulesLogic } from 'json-logic-js';

import { evaluateWidgetVisibility } from '@/page-layout/utils/evaluateWidgetVisibility';

describe('evaluateWidgetVisibility', () => {
  it('should return true (visible) when no conditionalDisplay is provided', () => {
    const result = evaluateWidgetVisibility({
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
      conditionalDisplay,
      context: {
        device: 'MOBILE',
      },
    });

    const resultDesktop = evaluateWidgetVisibility({
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
        conditionalDisplay: invalidConditionalDisplay,
        context: {
          device: 'DESKTOP',
        },
      });
    }).toThrow();
  });
});
