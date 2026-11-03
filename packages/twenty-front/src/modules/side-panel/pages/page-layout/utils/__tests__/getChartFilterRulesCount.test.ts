import { type RecordFiltersWithGroups } from '@/object-record/record-filter/types/RecordFiltersWithGroups';
import { getChartFilterRulesCount } from '@/side-panel/pages/page-layout/utils/getChartFilterRulesCount';

describe('getChartFilterRulesCount', () => {
  it('should return 0 for undefined filter', () => {
    expect(getChartFilterRulesCount(undefined)).toBe(0);
  });

  it('should return 0 when no root group exists', () => {
    const filter: RecordFiltersWithGroups = {
      recordFilters: [],
      recordFilterGroups: [],
    };

    expect(getChartFilterRulesCount(filter)).toBe(0);
  });

  it('should return count of filters in root group', () => {
    const filter: RecordFiltersWithGroups = {
      recordFilterGroups: [
        { id: 'root', parentRecordFilterGroupId: undefined },
      ],
      recordFilters: [
        { id: 'filter-1', recordFilterGroupId: 'root' },
        { id: 'filter-2', recordFilterGroupId: 'root' },
      ],
    } as RecordFiltersWithGroups;

    expect(getChartFilterRulesCount(filter)).toBe(2);
  });

  it('should count both direct filters and nested groups as children', () => {
    const filter: RecordFiltersWithGroups = {
      recordFilterGroups: [
        { id: 'root', parentRecordFilterGroupId: undefined },
        { id: 'nested-group', parentRecordFilterGroupId: 'root' },
      ],
      recordFilters: [
        { id: 'filter-1', recordFilterGroupId: 'root' },
        { id: 'filter-2', recordFilterGroupId: 'nested-group' },
      ],
    } as RecordFiltersWithGroups;

    expect(getChartFilterRulesCount(filter)).toBe(2);
  });
});
