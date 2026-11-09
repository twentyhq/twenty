import { isPageLayoutFilterValueEqual } from '@/page-layout/utils/isPageLayoutFilterValueEqual';
import { ViewFilterOperand } from '~/generated-metadata/graphql';

const THIS_MONTH = {
  conditions: [
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
  ],
};

describe('isPageLayoutFilterValueEqual', () => {
  it('should treat the same range in another condition order as equal', () => {
    const after = { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' };
    const before = {
      operand: ViewFilterOperand.IS_BEFORE,
      value: '2026-02-01',
    };

    expect(
      isPageLayoutFilterValueEqual({
        firstValue: { conditions: [after, before] },
        secondValue: { conditions: [before, after] },
      }),
    ).toBe(true);
  });

  it('should treat no value and an empty value as equal', () => {
    expect(
      isPageLayoutFilterValueEqual({
        firstValue: { conditions: [] },
        secondValue: null,
      }),
    ).toBe(true);
  });

  it('should compare conditions without their typename', () => {
    expect(
      isPageLayoutFilterValueEqual({
        firstValue: THIS_MONTH,
        secondValue: {
          conditions: [
            {
              __typename: 'PageLayoutFilterCondition',
              operand: ViewFilterOperand.IS_RELATIVE,
              value: 'THIS_1_MONTH',
            },
          ],
        },
      }),
    ).toBe(true);
  });

  it('should tell apart a different value', () => {
    expect(
      isPageLayoutFilterValueEqual({
        firstValue: THIS_MONTH,
        secondValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_7_DAY' },
          ],
        },
      }),
    ).toBe(false);
  });

  it('should tell apart a value from an empty value', () => {
    expect(
      isPageLayoutFilterValueEqual({
        firstValue: THIS_MONTH,
        secondValue: null,
      }),
    ).toBe(false);
  });
});
