import { resolveCssCalcExpressionInPixels } from '@/host/scroll/utils/resolveCssCalcExpressionInPixels';

describe('resolveCssCalcExpressionInPixels', () => {
  it('should add a percentage resolved against the reference size to a pixel length', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '10% + 20px',
        referenceSize: 200,
      }),
    ).toBe(40);
  });

  it('should apply multiplication before subtraction', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '100% - 2 * 8px',
        referenceSize: 100,
      }),
    ).toBe(84);
  });

  it('should evaluate parenthesised sub-expressions and division', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '(50% + 10px) / 2',
        referenceSize: 100,
      }),
    ).toBe(30);
  });

  it('should read negative and fractional pixel terms', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '-4.5px + 0.5px',
        referenceSize: 100,
      }),
    ).toBe(-4);
  });

  it('should resolve to zero for a unit computed styles never leave unresolved', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '10em + 4px',
        referenceSize: 100,
      }),
    ).toBe(0);
  });

  it('should resolve a malformed expression to zero', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '10px +',
        referenceSize: 100,
      }),
    ).toBe(0);
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '(10px',
        referenceSize: 100,
      }),
    ).toBe(0);
  });

  it('should resolve a division by zero to zero', () => {
    expect(
      resolveCssCalcExpressionInPixels({
        expression: '10px / 0',
        referenceSize: 100,
      }),
    ).toBe(0);
  });
});
