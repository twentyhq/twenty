import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import { ViewFilterOperand } from 'twenty-shared/types';

const THIS_MONTH = {
  conditions: [
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
  ],
};

const LAST_YEAR = {
  conditions: [
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'PAST_1_YEAR' },
  ],
};

describe('getEffectiveDashboardFilterValues', () => {
  it('should prefer the URL value, then the layout default, then no filter', () => {
    expect(
      getEffectiveDashboardFilterValues({
        pageLayoutFilters: [
          { id: 'from-url', defaultValue: THIS_MONTH },
          { id: 'from-default', defaultValue: THIS_MONTH },
          { id: 'without-value', defaultValue: null },
        ],
        urlValueByPageLayoutFilterId: { 'from-url': LAST_YEAR },
      }),
    ).toEqual({ 'from-url': LAST_YEAR, 'from-default': THIS_MONTH });
  });

  it('should let an empty URL value clear the layout default', () => {
    expect(
      getEffectiveDashboardFilterValues({
        pageLayoutFilters: [{ id: 'period', defaultValue: THIS_MONTH }],
        urlValueByPageLayoutFilterId: { period: { conditions: [] } },
      }),
    ).toEqual({});
  });

  it('should ignore URL values for filters the layout does not define', () => {
    expect(
      getEffectiveDashboardFilterValues({
        pageLayoutFilters: [],
        urlValueByPageLayoutFilterId: { removed: LAST_YEAR },
      }),
    ).toEqual({});
  });

  it('should drop GraphQL typenames from the layout default', () => {
    const defaultValue = {
      __typename: 'PageLayoutFilterValue',
      conditions: [
        {
          __typename: 'PageLayoutFilterCondition',
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH',
        },
      ],
    };

    expect(
      getEffectiveDashboardFilterValues({
        pageLayoutFilters: [{ id: 'period', defaultValue }],
        urlValueByPageLayoutFilterId: {},
      }),
    ).toEqual({ period: THIS_MONTH });
  });
});
