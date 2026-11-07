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
    { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
  ],
};

const COMMON_ARGS = {
  timeZone: 'Asia/Tokyo',
  firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
};

describe('computeDashboardFilterForWidget', () => {
  it('should only send and resolve the filters the widget binds', () => {
    const result = computeDashboardFilterForWidget({
      ...COMMON_ARGS,
      values: { [PERIOD_FILTER_ID]: THIS_MONTH, [OTHER_FILTER_ID]: THIS_MONTH },
      bindings: [
        {
          pageLayoutFilterId: PERIOD_FILTER_ID,
          fieldMetadataId: CLOSE_DATE_FIELD.id,
        },
      ],
      fields: [CLOSE_DATE_FIELD],
    });

    expect(result.boundDashboardFilterValues).toEqual([
      { pageLayoutFilterId: PERIOD_FILTER_ID, ...THIS_MONTH },
    ]);
    expect(result.recordFilters).toEqual([
      {
        fieldMetadataId: CLOSE_DATE_FIELD.id,
        operand: ViewFilterOperand.IS_RELATIVE,
        value: 'THIS_1_MONTH;;Asia/Tokyo;;MONDAY;;',
      },
    ]);
    expect(result.unresolvedBindings).toEqual([]);
  });

  it('should report a binding to a field the viewer cannot read', () => {
    const binding = {
      pageLayoutFilterId: PERIOD_FILTER_ID,
      fieldMetadataId: CLOSE_DATE_FIELD.id,
    };

    const result = computeDashboardFilterForWidget({
      ...COMMON_ARGS,
      values: { [PERIOD_FILTER_ID]: THIS_MONTH },
      bindings: [binding],
      fields: [],
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.unresolvedBindings).toEqual([binding]);
  });

  it('should treat a value that cannot be resolved as unresolved instead of unfiltered', () => {
    const binding = {
      pageLayoutFilterId: PERIOD_FILTER_ID,
      fieldMetadataId: CREATED_AT_FIELD.id,
    };

    const result = computeDashboardFilterForWidget({
      ...COMMON_ARGS,
      values: {
        [PERIOD_FILTER_ID]: {
          conditions: [{ operand: ViewFilterOperand.IS, value: '0001-01-01' }],
        },
      },
      bindings: [binding],
      fields: [CREATED_AT_FIELD],
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.unresolvedBindings).toEqual([binding]);
  });
});
