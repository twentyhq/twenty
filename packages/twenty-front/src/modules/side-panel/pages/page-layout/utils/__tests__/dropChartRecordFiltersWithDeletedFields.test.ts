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

  it('should preserve record filter groups that still contain valid filters', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'valid-field', recordFilterGroupId: 'root' },
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

  it('should remove orphaned root group when all its filters are dropped', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'deleted-field', recordFilterGroupId: 'root' },
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
      validFieldMetadataIds: new Set(),
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.recordFilterGroups).toEqual([]);
  });

  it('should remove orphaned child group when its only filter is dropped, but keep root group if it has other valid children', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'valid-field', recordFilterGroupId: 'root' },
        { id: 'filter-2', fieldMetadataId: 'deleted-field', recordFilterGroupId: 'child' },
      ],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'child',
          parentRecordFilterGroupId: 'root',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
    } as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(['valid-field']),
    });

    expect(result.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: 'valid-field', recordFilterGroupId: 'root' },
    ]);
    expect(result.recordFilterGroups).toEqual([
      {
        id: 'root',
        parentRecordFilterGroupId: undefined,
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ]);
  });

  it('should remove both child and root group when all filters are dropped', () => {
    const chartFilters: ChartFilters = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'deleted-field', recordFilterGroupId: 'child' },
      ],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
        {
          id: 'child',
          parentRecordFilterGroupId: 'root',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
    } as ChartFilters;

    const result = dropChartRecordFiltersWithDeletedFields({
      chartFilters,
      validFieldMetadataIds: new Set(),
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.recordFilterGroups).toEqual([]);
  });
});
