import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type ChartFilters } from '@/side-panel/pages/page-layout/types/ChartFilters';
import { dropChartRecordFiltersWithDeletedFields } from '@/side-panel/pages/page-layout/utils/dropChartRecordFiltersWithDeletedFields';

describe('dropChartRecordFiltersWithDeletedFields', () => {
  it('should drop record filters referencing fields that no longer exist', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'valid-field' },
        { id: 'filter-2', fieldMetadataId: 'deleted-field' },
      ],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
      ],
    } as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(['valid-field']),
    });

    expect(result.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: 'valid-field' },
    ]);
  });

  it('should preserve record filter groups', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
      ],
    } as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(),
    });

    expect(result.recordFilterGroups).toEqual([
      {
        id: 'root',
        parentRecordFilterGroupId: undefined,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ]);
  });

  it('should keep all record filters when every field is still valid', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'field-a' },
        { id: 'filter-2', fieldMetadataId: 'field-b' },
      ],
    } as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(['field-a', 'field-b']),
    });

    expect(result.recordFilters).toHaveLength(2);
  });

  it('should handle undefined record filters', () => {
    const chartFilters: ChartFilters = {} as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(['field-a']),
    });

    expect(result.recordFilters).toEqual([]);
  });
});
