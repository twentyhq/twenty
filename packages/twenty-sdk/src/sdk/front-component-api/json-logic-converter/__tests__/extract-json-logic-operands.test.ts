import { describe, expect, it } from 'vitest';

import { extractJsonLogicOperands } from '../utils/extract-json-logic-operands';

describe('extractJsonLogicOperands', () => {
  it('extracts operands when the rule has the matching operator', () => {
    const rule = { and: [true, false, { var: 'x' }] };

    expect(extractJsonLogicOperands(rule, 'and')).toEqual([
      true,
      false,
      { var: 'x' },
    ]);
  });

  it('wraps the rule in an array when the operator does not match', () => {
    const rule = { or: [true, false] };

    expect(extractJsonLogicOperands(rule, 'and')).toEqual([rule]);
  });

  it('wraps primitive rules in an array', () => {
    expect(extractJsonLogicOperands(true, 'and')).toEqual([true]);
    expect(extractJsonLogicOperands('hello', 'or')).toEqual(['hello']);
    expect(extractJsonLogicOperands(42, 'and')).toEqual([42]);
    expect(extractJsonLogicOperands(null, 'or')).toEqual([null]);
  });

  it('wraps array rules in an array', () => {
    const rule = [true, false];

    expect(extractJsonLogicOperands(rule, 'and')).toEqual([rule]);
  });

  it('handles nested json-logic objects without the target operator', () => {
    const rule = { '===': [{ var: 'x' }, 1] };

    expect(extractJsonLogicOperands(rule, 'and')).toEqual([rule]);
  });
});
