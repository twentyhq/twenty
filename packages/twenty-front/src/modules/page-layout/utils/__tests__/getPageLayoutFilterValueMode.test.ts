import { getPageLayoutFilterValueMode } from '@/page-layout/utils/getPageLayoutFilterValueMode';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const buildValue = (operands: ViewFilterOperand[]) => ({
  conditions: operands.map((operand) => ({ operand, value: '2026-01-01' })),
});

describe('getPageLayoutFilterValueMode', () => {
  it('should read no value as no default', () => {
    expect(getPageLayoutFilterValueMode(null)).toBe('NONE');
    expect(getPageLayoutFilterValueMode(buildValue([]))).toBe('NONE');
  });

  it('should read a single relative condition as a relative date', () => {
    expect(
      getPageLayoutFilterValueMode(buildValue([ViewFilterOperand.IS_RELATIVE])),
    ).toBe('RELATIVE');
  });

  it('should read a start and an end bound, or either alone, as a date range', () => {
    expect(
      getPageLayoutFilterValueMode(
        buildValue([ViewFilterOperand.IS_AFTER, ViewFilterOperand.IS_BEFORE]),
      ),
    ).toBe('DATE_RANGE');
    expect(
      getPageLayoutFilterValueMode(buildValue([ViewFilterOperand.IS_BEFORE])),
    ).toBe('DATE_RANGE');
  });

  it.each([
    [[ViewFilterOperand.IS]],
    [[ViewFilterOperand.IS_TODAY]],
    [[ViewFilterOperand.IS_AFTER, ViewFilterOperand.IS_AFTER]],
    [[ViewFilterOperand.IS_RELATIVE, ViewFilterOperand.IS_BEFORE]],
  ])('should read %j, which the editor cannot edit, as custom', (operands) => {
    expect(getPageLayoutFilterValueMode(buildValue(operands))).toBe('CUSTOM');
  });
});
