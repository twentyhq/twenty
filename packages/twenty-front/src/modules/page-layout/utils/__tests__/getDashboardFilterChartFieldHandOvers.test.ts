import { getDashboardFilterChartFieldHandOvers } from '@/page-layout/utils/getDashboardFilterChartFieldHandOvers';
import { DASHBOARD_DATE_RANGE_FILTER } from 'twenty-shared/constants';
import { ViewFilterOperand } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const CLOSE_DATE_CONDITION = {
  id: 'close-date-condition',
  fieldMetadataId: 'close-date-field',
  operand: ViewFilterOperand.IS_RELATIVE,
  value: 'PAST_30_DAY',
};

const getHandOvers = ({
  fieldMetadataId = 'close-date-field',
  recordFilterGroupId,
  defaultValue = null,
}: {
  fieldMetadataId?: string | null;
  recordFilterGroupId?: string;
  defaultValue?: typeof DASHBOARD_DATE_RANGE_FILTER.defaultValue;
}) =>
  getDashboardFilterChartFieldHandOvers({
    settings: [
      {
        pageLayoutFilter: { ...DASHBOARD_DATE_RANGE_FILTER, defaultValue },
        resolution: isDefined(fieldMetadataId)
          ? { fieldMetadataId, source: 'WIDGET_FILTER' }
          : { fieldMetadataId: null, source: 'NOT_APPLIED' },
      },
    ],
    chartFilter: {
      recordFilters: [{ ...CLOSE_DATE_CONDITION, recordFilterGroupId }],
      recordFilterGroups: [{ id: 'or', logicalOperator: 'OR' }],
    },
  });

describe('getDashboardFilterChartFieldHandOvers', () => {
  it('should offer the field of a top-level condition, without that condition', () => {
    expect(getHandOvers({})).toEqual([
      {
        pageLayoutFilterId: DASHBOARD_DATE_RANGE_FILTER.id,
        label: 'Date range',
        hasDefaultValue: false,
        fieldMetadataId: 'close-date-field',
        filterWithoutFieldConditions: {
          recordFilters: [],
          recordFilterGroups: [{ id: 'or', logicalOperator: 'OR' }],
        },
      },
    ]);
  });

  it('should say whether the filter has a default', () => {
    expect(
      getHandOvers({
        defaultValue: {
          conditions: [
            { operand: ViewFilterOperand.IS_RELATIVE, value: 'THIS_1_MONTH' },
          ],
        },
      }),
    ).toMatchObject([{ hasDefaultValue: true }]);
  });

  it('should offer nothing when the condition sits in an OR group', () => {
    expect(getHandOvers({ recordFilterGroupId: 'or' })).toEqual([]);
  });

  it('should offer nothing for a filter that resolves to no field', () => {
    expect(getHandOvers({ fieldMetadataId: null })).toEqual([]);
  });
});
