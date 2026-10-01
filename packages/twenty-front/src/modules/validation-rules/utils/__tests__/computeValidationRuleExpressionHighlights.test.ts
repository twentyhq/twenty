import { computeValidationRuleExpressionHighlights } from '@/validation-rules/utils/computeValidationRuleExpressionHighlights';

describe('computeValidationRuleExpressionHighlights', () => {
  it('should colour functions, keywords, strings, numbers and operators but not fields', () => {
    const expression = 'isDefined(amount) and stage != "WON" or employees > 3';

    expect(
      computeValidationRuleExpressionHighlights(expression).map(
        ({ kind, start, end }) => `${kind}:${expression.slice(start, end)}`,
      ),
    ).toEqual([
      'function:isDefined',
      'keyword:and',
      'operator:!',
      'operator:=',
      'string:"WON"',
      'keyword:or',
      'operator:>',
      'number:3',
    ]);
  });
});
