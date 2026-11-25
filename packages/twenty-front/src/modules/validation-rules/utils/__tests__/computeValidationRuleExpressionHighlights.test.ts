import { computeValidationRuleExpressionHighlights } from '@/validation-rules/utils/computeValidationRuleExpressionHighlights';

describe('computeValidationRuleExpressionHighlights', () => {
  it('should colour only the function names it is given', () => {
    const expression = 'count(tasks)';
    const toHighlightedTexts = (functionNames?: string[]) =>
      computeValidationRuleExpressionHighlights({
        expression,
        functionNames,
      }).map(
        ({ kind, start, end }) => `${kind}:${expression.slice(start, end)}`,
      );

    expect(toHighlightedTexts()).toEqual([]);
    expect(toHighlightedTexts(['count'])).toEqual(['function:count']);
  });

  it('should colour functions, keywords, strings, numbers and operators but not fields', () => {
    const expression = 'isDefined(amount) and stage != "WON" or employees > 3';

    expect(
      computeValidationRuleExpressionHighlights({ expression }).map(
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
