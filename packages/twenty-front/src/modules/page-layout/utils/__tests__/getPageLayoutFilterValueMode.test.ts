import { getPageLayoutFilterValueMode } from '@/page-layout/utils/getPageLayoutFilterValueMode';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const buildValue = (operands: ViewFilterOperand[]) => ({
  conditions: operands.map((operand) => ({ operand, value: '2026-01-01' })),
});

const buildRange = (startDate: string, dayAfterEndDate: string) => ({
  conditions: [
    { operand: ViewFilterOperand.IS_AFTER, value: startDate },
    { operand: ViewFilterOperand.IS_BEFORE, value: dayAfterEndDate },
  ],
});

describe('getPageLayoutFilterValueMode', () => {
  it('should read no value as no default', () => {
    expect(getPageLayoutFilterValueMode(null)).toBe('NONE');
    expect(getPageLayoutFilterValueMode(buildValue([]))).toBe('NONE');
  });

  it.each(['PAST_7_DAY', 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;'])(
    'should read the relative date %s as a relative date',
    (value) => {
      expect(
        getPageLayoutFilterValueMode({
          conditions: [{ operand: ViewFilterOperand.IS_RELATIVE, value }],
        }),
      ).toBe('RELATIVE');
    },
  );

  it.each(['PAST_3_HOUR', 'SOON', 'PAST_999999_DAY'])(
    'should read the relative date %s, which the picker cannot show, as custom',
    (value) => {
      expect(
        getPageLayoutFilterValueMode({
          conditions: [{ operand: ViewFilterOperand.IS_RELATIVE, value }],
        }),
      ).toBe('OTHER');
    },
  );

  it('should read a start and an end bound, or either alone, as a date range', () => {
    expect(
      getPageLayoutFilterValueMode(buildRange('2026-01-01', '2026-01-02')),
    ).toBe('CUSTOM_RANGE');
    expect(
      getPageLayoutFilterValueMode(buildValue([ViewFilterOperand.IS_BEFORE])),
    ).toBe('CUSTOM_RANGE');
  });

  it.each([
    [[ViewFilterOperand.IS]],
    [[ViewFilterOperand.IS_TODAY]],
    [[ViewFilterOperand.IS_AFTER, ViewFilterOperand.IS_AFTER]],
    [[ViewFilterOperand.IS_RELATIVE, ViewFilterOperand.IS_BEFORE]],
  ])('should read %j, which the editor cannot edit, as custom', (operands) => {
    expect(getPageLayoutFilterValueMode(buildValue(operands))).toBe('OTHER');
  });

  it.each([
    ['an empty', '2024-03-10', '2024-03-10'],
    ['a reversed', '2024-03-10', '2024-03-01'],
  ])(
    'should read %s range, which has no day to show, as custom',
    (_, startDate, dayAfterEndDate) => {
      expect(
        getPageLayoutFilterValueMode(buildRange(startDate, dayAfterEndDate)),
      ).toBe('OTHER');
    },
  );
});
