import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { buildDashboardFilterForWidget } from 'twenty-shared/utils';

const VIEWER = {
  timeZone: 'America/New_York',
  firstDayOfTheWeek: FirstDayOfTheWeek.SUNDAY,
};

const THIS_MONTH = {
  conditions: [
    {
      operand: ViewFilterOperand.IS_RELATIVE,
      value: 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;',
    },
  ],
};

const LAST_YEAR = {
  conditions: [
    {
      operand: ViewFilterOperand.IS_RELATIVE,
      value: 'PAST_1_YEAR;;Europe/Paris;;MONDAY;;',
    },
  ],
};

describe('getEffectiveDashboardFilterValues', () => {
  it('should prefer the URL value, then the layout default, then no filter', () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
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
        ...VIEWER,
        pageLayoutFilters: [{ id: 'period', defaultValue: THIS_MONTH }],
        urlValueByPageLayoutFilterId: { period: { conditions: [] } },
      }),
    ).toEqual({});
  });

  it('should ignore URL values for filters the layout does not define', () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
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
          value: 'THIS_1_MONTH;;Europe/Paris;;MONDAY;;',
        },
      ],
    };

    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [{ id: 'period', defaultValue }],
        urlValueByPageLayoutFilterId: {},
      }),
    ).toEqual({ period: THIS_MONTH });
  });

  it("should embed the viewer's week start in a relative value that has none", () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [{ id: 'period', defaultValue: null }],
        urlValueByPageLayoutFilterId: {
          period: {
            conditions: [
              { operand: ViewFilterOperand.IS_RELATIVE, value: 'NEXT_1_WEEK' },
              { operand: ViewFilterOperand.IS_AFTER, value: '2026-11-01' },
            ],
          },
        },
      }),
    ).toEqual({
      period: {
        conditions: [
          {
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'NEXT_1_WEEK;;America/New_York;;SUNDAY;;',
          },
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-11-01' },
        ],
      },
    });
  });

  it('should resolve a week the same way whatever week start a widget falls back to', () => {
    const { period } = getEffectiveDashboardFilterValues({
      ...VIEWER,
      pageLayoutFilters: [{ id: 'period', defaultValue: null }],
      urlValueByPageLayoutFilterId: {
        period: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' },
          ],
        },
      },
    });

    const buildWithFallbackWeekStart = (firstDayOfTheWeek: FirstDayOfTheWeek) =>
      buildDashboardFilterForWidget({
        values: { period },
        bindings: [{ pageLayoutFilterId: 'period', fieldMetadataId: 'close' }],
        fields: [{ id: 'close', type: FieldMetadataType.DATE }],
        timeZone: VIEWER.timeZone,
        firstDayOfTheWeek,
      }).recordFilters;

    expect(buildWithFallbackWeekStart(FirstDayOfTheWeek.MONDAY)).toEqual(
      buildWithFallbackWeekStart(FirstDayOfTheWeek.SUNDAY),
    );
  });
});
