import { appendRecordFiltersToChartFilter } from '@/page-layout/dashboard-filters/utils/appendRecordFiltersToChartFilter';
import { ViewFilterOperand } from 'twenty-shared/types';
import { type RecordFilter } from 'twenty-shared/utils';

const DASHBOARD_RECORD_FILTER: RecordFilter = {
  id: 'dashboard-filter-date',
  fieldMetadataId: 'created-at-id',
  type: 'DATE_TIME',
  operand: ViewFilterOperand.IS_TODAY,
  value: '',
};

describe('appendRecordFiltersToChartFilter', () => {
  it('returns the chart filter untouched when there is nothing to append', () => {
    const chartFilter = { recordFilters: [], recordFilterGroups: [] };

    expect(
      appendRecordFiltersToChartFilter({ chartFilter, recordFilters: [] }),
    ).toBe(chartFilter);
  });

  it('creates a chart filter when the chart has none', () => {
    expect(
      appendRecordFiltersToChartFilter({
        chartFilter: undefined,
        recordFilters: [DASHBOARD_RECORD_FILTER],
      }),
    ).toEqual({ recordFilters: [DASHBOARD_RECORD_FILTER] });
  });

  it('appends after the chart own filters and keeps its groups', () => {
    const chartOwnRecordFilter = {
      fieldMetadataId: 'stage-id',
      operand: ViewFilterOperand.IS,
      value: '["WON"]',
    };
    const recordFilterGroups = [{ id: 'group-1', logicalOperator: 'AND' }];

    const chartFilter = {
      recordFilters: [chartOwnRecordFilter],
      recordFilterGroups,
    };

    const result = appendRecordFiltersToChartFilter({
      chartFilter,
      recordFilters: [DASHBOARD_RECORD_FILTER],
    });

    expect(result).toEqual({
      recordFilters: [chartOwnRecordFilter, DASHBOARD_RECORD_FILTER],
      recordFilterGroups,
    });
    expect(chartFilter.recordFilters).toEqual([chartOwnRecordFilter]);
  });
});
