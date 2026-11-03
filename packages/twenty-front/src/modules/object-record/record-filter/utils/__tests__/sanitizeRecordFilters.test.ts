import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type RecordFiltersWithGroups } from '@/object-record/record-filter/types/RecordFiltersWithGroups';
import { sanitizeRecordFilters } from '@/object-record/record-filter/utils/sanitizeRecordFilters';

describe('sanitizeRecordFilters', () => {
  it('should drop record filters referencing fields that no longer exist', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
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
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [{ id: 'valid-field', isActive: true }],
    });

    expect(result.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: 'valid-field' },
    ]);
  });

  it('should preserve record filter groups that still contain valid filters', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [
        {
          id: 'filter-1',
          fieldMetadataId: 'valid-field',
          recordFilterGroupId: 'root',
        },
      ],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
      ],
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [{ id: 'valid-field', isActive: true }],
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
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [
        { id: 'filter-1', fieldMetadataId: 'field-a' },
        { id: 'filter-2', fieldMetadataId: 'field-b' },
      ],
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [
        { id: 'field-a', isActive: true },
        { id: 'field-b', isActive: true },
      ],
    });

    expect(result.recordFilters).toHaveLength(2);
  });

  it('should handle undefined record filters', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups =
      {} as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [{ id: 'field-a', isActive: true }],
    });

    expect(result.recordFilters).toEqual([]);
  });

  it('should remove orphaned root group when all its filters are dropped', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [
        {
          id: 'filter-1',
          fieldMetadataId: 'deleted-field',
          recordFilterGroupId: 'root',
        },
      ],
      recordFilterGroups: [
        {
          id: 'root',
          parentRecordFilterGroupId: undefined,
          logicalOperator: RecordFilterGroupLogicalOperator.AND,
        },
      ],
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [],
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.recordFilterGroups).toEqual([]);
  });

  it('should remove orphaned child group when its only filter is dropped, but keep root group if it has other valid children', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [
        {
          id: 'filter-1',
          fieldMetadataId: 'valid-field',
          recordFilterGroupId: 'root',
        },
        {
          id: 'filter-2',
          fieldMetadataId: 'deleted-field',
          recordFilterGroupId: 'child',
        },
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
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [{ id: 'valid-field', isActive: true }],
    });

    expect(result.recordFilters).toEqual([
      {
        id: 'filter-1',
        fieldMetadataId: 'valid-field',
        recordFilterGroupId: 'root',
      },
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
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [
        {
          id: 'filter-1',
          fieldMetadataId: 'deleted-field',
          recordFilterGroupId: 'child',
        },
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
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [],
    });

    expect(result.recordFilters).toEqual([]);
    expect(result.recordFilterGroups).toEqual([]);
  });

  it('should point record filters on a morph relation target at the morph relation field', () => {
    const recordFiltersWithGroups: RecordFiltersWithGroups = {
      recordFilters: [{ id: 'filter-1', fieldMetadataId: 'morph-target' }],
    } as RecordFiltersWithGroups;

    const result = sanitizeRecordFilters({
      recordFiltersWithGroups,
      fieldMetadataItems: [
        {
          id: 'morph-head',
          isActive: true,
          morphRelations: [{ sourceFieldMetadata: { id: 'morph-target' } }],
        },
      ],
    });

    expect(result.recordFilters).toEqual([
      { id: 'filter-1', fieldMetadataId: 'morph-head' },
    ]);
  });
});
