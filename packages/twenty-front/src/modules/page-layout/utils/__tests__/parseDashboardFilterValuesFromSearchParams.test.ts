import { parseDashboardFilterValuesFromSearchParams } from '@/page-layout/utils/parseDashboardFilterValuesFromSearchParams';
import { setDashboardFilterValueInSearchParams } from '@/page-layout/utils/setDashboardFilterValueInSearchParams';
import { ViewFilterOperand } from 'twenty-shared/types';

const DATE_RANGE_FILTER_ID = '6f2b8f1e-6a3c-4f4e-9d61-2f1c8a7b5e01';
const SIGNUP_FILTER_ID = '0d9a3c55-2b8e-4b1f-9c7a-3e5f6a7b8c90';

const parse = (searchParams: string[]) =>
  parseDashboardFilterValuesFromSearchParams(
    new URLSearchParams(searchParams.join('&')),
  );

describe('parseDashboardFilterValuesFromSearchParams', () => {
  it('should round-trip a value written by setDashboardFilterValueInSearchParams', () => {
    const value = {
      conditions: [
        { operand: ViewFilterOperand.IS_AFTER, value: '2026-01-01' },
        { operand: ViewFilterOperand.IS_BEFORE, value: '2026-04-01' },
      ],
    };

    const searchParams = setDashboardFilterValueInSearchParams({
      searchParams: new URLSearchParams('viewId=abc'),
      pageLayoutFilterId: DATE_RANGE_FILTER_ID,
      value,
    });

    expect(searchParams.get('viewId')).toBe('abc');
    expect(parseDashboardFilterValuesFromSearchParams(searchParams)).toEqual({
      [DATE_RANGE_FILTER_ID]: value,
    });
  });

  it('should keep an empty range, which filters out every record', () => {
    expect(
      parse([
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2024-03-10`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_BEFORE]=2024-03-10`,
      ]),
    ).toEqual({
      [DATE_RANGE_FILTER_ID]: {
        conditions: [
          { operand: ViewFilterOperand.IS_AFTER, value: '2024-03-10' },
          { operand: ViewFilterOperand.IS_BEFORE, value: '2024-03-10' },
        ],
      },
    });
  });

  it('should keep relative values with their time zone intact', () => {
    const value = {
      conditions: [
        {
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_30_DAY;;Europe/Paris;;MONDAY;;',
        },
      ],
    };

    const searchParams = setDashboardFilterValueInSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutFilterId: DATE_RANGE_FILTER_ID,
      value,
    });

    expect(
      parseDashboardFilterValuesFromSearchParams(
        new URLSearchParams(searchParams.toString()),
      ),
    ).toEqual({ [DATE_RANGE_FILTER_ID]: value });
  });

  it('should represent an explicit "no filter" as an empty conditions list', () => {
    const searchParams = setDashboardFilterValueInSearchParams({
      searchParams: new URLSearchParams(),
      pageLayoutFilterId: DATE_RANGE_FILTER_ID,
      value: { conditions: [] },
    });

    expect(parseDashboardFilterValuesFromSearchParams(searchParams)).toEqual({
      [DATE_RANGE_FILTER_ID]: { conditions: [] },
    });
  });

  it('should only remove the reset filter from the URL', () => {
    const resetSearchParams = setDashboardFilterValueInSearchParams({
      searchParams: new URLSearchParams(
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH&dashboardFilter[${SIGNUP_FILTER_ID}][IS]=2026-01-01`,
      ),
      pageLayoutFilterId: DATE_RANGE_FILTER_ID,
      value: null,
    });

    expect(
      parseDashboardFilterValuesFromSearchParams(resetSearchParams),
    ).toEqual({
      [SIGNUP_FILTER_ID]: {
        conditions: [{ operand: ViewFilterOperand.IS, value: '2026-01-01' }],
      },
    });
  });

  it('should ignore a filter whose operand or value is not supported', () => {
    expect(
      parse([
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2026-01-01`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_BEFORE]=not-a-date`,
        `dashboardFilter[${SIGNUP_FILTER_ID}][CONTAINS]=2026`,
        `filter[closeDate][IS_AFTER]=2026-01-01`,
      ]),
    ).toEqual({});
  });

  it.each([
    [
      'two relative conditions',
      [
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=PAST_1_YEAR`,
      ],
    ],
    [
      'a relative condition with a date',
      [
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_RELATIVE]=THIS_1_MONTH`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2026-01-01`,
      ],
    ],
    [
      'a repeated operand',
      [
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2026-01-01`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_AFTER]=2026-02-01`,
      ],
    ],
    [
      'a day with a range bound',
      [
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS]=2026-01-15`,
        `dashboardFilter[${DATE_RANGE_FILTER_ID}][IS_BEFORE]=2026-02-01`,
      ],
    ],
  ])(
    'should ignore %s, which the filter bar cannot show',
    (_, searchParams) => {
      expect(parse(searchParams)).toEqual({});
    },
  );
});
