import { type ChartFilters } from '@/command-menu/pages/page-layout/types/ChartFilters';
import { getChartFilterRulesCount } from '@/command-menu/pages/page-layout/utils/getChartFilterRulesCount';

describe('getChartFilterRulesCount', () => {
  it('should return 0 for undefined filter', () => {
    expect(getChartFilterRulesCount(undefined)).toBe(0);
  });

  it('should return 0 when no root group exists', () => {
    const filter: ChartFilters = {
      recordFilters: [],
      recordFilterGroups: [],
    };

    expect(getChartFilterRulesCount(filter)).toBe(0);
  });

  it('should return count of filters in root group', () => {
    const filter: ChartFilters = {
      recordFilterGroups: [
        { id: 'root', parentRecordFilterGroupId: undefined },
      ],
      recordFilters: [
        { id: 'filter-1', recordFilterGroupId: 'root' },
        { id: 'filter-2', recordFilterGroupId: 'root' },
      ],
    } as ChartFilters;

    expect(getChartFilterRulesCount(filter)).toBe(2);
  });

  it('should count both direct filters and nested groups as children', () => {
    const filter: ChartFilters = {
      recordFilterGroups: [
        { id: 'root', parentRecordFilterGroupId: undefined },
        { id: 'nested-group', parentRecordFilterGroupId: 'root' },
      ],
      recordFilters: [
        { id: 'filter-1', recordFilterGroupId: 'root' },
        { id: 'filter-2', recordFilterGroupId: 'nested-group' },
      ],
    } as ChartFilters;

    expect(getChartFilterRulesCount(filter)).toBe(2);
  });
});
