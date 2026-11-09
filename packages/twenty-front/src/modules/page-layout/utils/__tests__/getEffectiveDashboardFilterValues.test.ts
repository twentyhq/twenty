import { getEffectiveDashboardFilterValues } from '@/page-layout/utils/getEffectiveDashboardFilterValues';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  PageLayoutFilterType,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { buildDashboardFilterForWidget } from 'twenty-shared/utils';

const DATE = PageLayoutFilterType.DATE;

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
    const getValues = ({
      defaultValue,
      urlValueByPageLayoutFilterId,
    }: {
      defaultValue: typeof THIS_MONTH | null;
      urlValueByPageLayoutFilterId: Record<string, typeof LAST_YEAR>;
    }) =>
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [{ id: 'date-range', type: DATE, defaultValue }],
        urlValueByPageLayoutFilterId,
      });

    expect(
      getValues({
        defaultValue: THIS_MONTH,
        urlValueByPageLayoutFilterId: { 'date-range': LAST_YEAR },
      }),
    ).toEqual([{ pageLayoutFilterId: 'date-range', type: DATE, ...LAST_YEAR }]);
    expect(
      getValues({ defaultValue: THIS_MONTH, urlValueByPageLayoutFilterId: {} }),
    ).toEqual([
      { pageLayoutFilterId: 'date-range', type: DATE, ...THIS_MONTH },
    ]);
    expect(
      getValues({ defaultValue: null, urlValueByPageLayoutFilterId: {} }),
    ).toEqual([]);
  });

  it('should let an empty URL value clear the layout default', () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [
          { id: 'date-range', type: DATE, defaultValue: THIS_MONTH },
        ],
        urlValueByPageLayoutFilterId: { 'date-range': { conditions: [] } },
      }),
    ).toEqual([]);
  });

  it('should ignore URL values for filters the layout does not define', () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [],
        urlValueByPageLayoutFilterId: { removed: LAST_YEAR },
      }),
    ).toEqual([]);
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
        pageLayoutFilters: [{ id: 'date-range', type: DATE, defaultValue }],
        urlValueByPageLayoutFilterId: {},
      }),
    ).toEqual([
      { pageLayoutFilterId: 'date-range', type: DATE, ...THIS_MONTH },
    ]);
  });

  it("should embed the viewer's week start in a relative value that has none", () => {
    expect(
      getEffectiveDashboardFilterValues({
        ...VIEWER,
        pageLayoutFilters: [
          { id: 'date-range', type: DATE, defaultValue: null },
        ],
        urlValueByPageLayoutFilterId: {
          'date-range': {
            conditions: [
              { operand: ViewFilterOperand.IS_RELATIVE, value: 'NEXT_1_WEEK' },
              { operand: ViewFilterOperand.IS_AFTER, value: '2026-11-01' },
            ],
          },
        },
      }),
    ).toEqual([
      {
        pageLayoutFilterId: 'date-range',
        type: DATE,
        conditions: [
          {
            operand: ViewFilterOperand.IS_RELATIVE,
            value: 'NEXT_1_WEEK;;America/New_York;;SUNDAY;;',
          },
          { operand: ViewFilterOperand.IS_AFTER, value: '2026-11-01' },
        ],
      },
    ]);
  });

  it('should resolve a week the same way whatever week start a widget falls back to', () => {
    const values = getEffectiveDashboardFilterValues({
      ...VIEWER,
      pageLayoutFilters: [{ id: 'date-range', type: DATE, defaultValue: null }],
      urlValueByPageLayoutFilterId: {
        'date-range': {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_WEEK' },
          ],
        },
      },
    });

    const buildWithFallbackWeekStart = (firstDayOfTheWeek: FirstDayOfTheWeek) =>
      buildDashboardFilterForWidget({
        values,
        bindings: [
          { pageLayoutFilterId: 'date-range', fieldMetadataId: 'close' },
        ],
        groupByFieldMetadataIds: [],
        widgetFilterFieldMetadataIds: [],
        fields: [
          { id: 'close', name: 'closeDate', type: FieldMetadataType.DATE },
        ],
        timeZone: VIEWER.timeZone,
        firstDayOfTheWeek,
      }).recordFilters;

    expect(buildWithFallbackWeekStart(FirstDayOfTheWeek.MONDAY)).toEqual(
      buildWithFallbackWeekStart(FirstDayOfTheWeek.SUNDAY),
    );
  });
});
