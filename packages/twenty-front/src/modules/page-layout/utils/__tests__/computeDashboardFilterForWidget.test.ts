import { computeDashboardFilterForWidget } from '@/page-layout/utils/computeDashboardFilterForWidget';
import {
  FieldMetadataType,
  FirstDayOfTheWeek,
  ViewFilterOperand,
} from 'twenty-shared/types';

const PERIOD_FILTER_ID = 'period-filter-id';
const OTHER_FILTER_ID = 'other-filter-id';
const CLOSE_DATE_FIELD = { id: 'close-date-id', type: FieldMetadataType.DATE };
const CREATED_AT_FIELD = {
  id: 'created-at-id',
  type: FieldMetadataType.DATE_TIME,
};

const THIS_MONTH = {
  conditions: [
    {
      operand: ViewFilterOperand.IS_RELATIVE,
      value: 'THIS_1_MONTH;;Asia/Tokyo;;MONDAY;;',
    },
  ],
};

const VIEWER = {
  timeZone: 'Asia/Tokyo',
  firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
};

describe('computeDashboardFilterForWidget', () => {
  it('should only send and resolve the filters the widget binds', () => {
    expect(
      computeDashboardFilterForWidget({
        ...VIEWER,
        values: {
          [PERIOD_FILTER_ID]: THIS_MONTH,
          [OTHER_FILTER_ID]: THIS_MONTH,
        },
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: CLOSE_DATE_FIELD.id,
          },
        ],
        fields: [CLOSE_DATE_FIELD],
      }),
    ).toEqual({
      boundDashboardFilterValues: [
        { pageLayoutFilterId: PERIOD_FILTER_ID, ...THIS_MONTH },
      ],
      recordFilters: [
        {
          fieldMetadataId: CLOSE_DATE_FIELD.id,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'THIS_1_MONTH;;Asia/Tokyo;;MONDAY;;',
        },
      ],
      isInvalid: false,
    });
  });

  it('should be invalid when a bound field is missing from the object', () => {
    expect(
      computeDashboardFilterForWidget({
        ...VIEWER,
        values: { [PERIOD_FILTER_ID]: THIS_MONTH },
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: 'deleted-field-id',
          },
        ],
        fields: [CLOSE_DATE_FIELD],
      }),
    ).toEqual({
      boundDashboardFilterValues: [],
      recordFilters: [],
      isInvalid: true,
    });
  });

  it('should be invalid instead of unfiltered when a value cannot be resolved', () => {
    expect(
      computeDashboardFilterForWidget({
        ...VIEWER,
        timeZone: 'America/New_York',
        values: {
          [PERIOD_FILTER_ID]: {
            conditions: [
              { operand: ViewFilterOperand.IS, value: '9999-12-31' },
            ],
          },
        },
        bindings: [
          {
            pageLayoutFilterId: PERIOD_FILTER_ID,
            fieldMetadataId: CREATED_AT_FIELD.id,
          },
        ],
        fields: [CREATED_AT_FIELD],
      }),
    ).toEqual({
      boundDashboardFilterValues: [],
      recordFilters: [],
      isInvalid: true,
    });
  });
});
