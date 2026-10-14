import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { attachUngroupedRecordFiltersToRootRecordFilterGroup } from '@/object-record/record-filter-group/utils/attachUngroupedRecordFiltersToRootRecordFilterGroup';
import { type PersistedRecordFilter } from '@/object-record/record-filter/types/PersistedRecordFilter';
import {
  RecordFilterGroupLogicalOperator,
  ViewFilterOperand,
} from 'twenty-shared/types';

const buildRecordFilter = (
  recordFilter: Partial<PersistedRecordFilter> & { id: string },
): PersistedRecordFilter => ({
  fieldMetadataId: 'field-id',
  operand: ViewFilterOperand.IS,
  value: '',
  ...recordFilter,
});

const andRootRecordFilterGroup: RecordFilterGroup = {
  id: 'root-group-id',
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
};

describe('attachUngroupedRecordFiltersToRootRecordFilterGroup', () => {
  it('should leave filters and groups untouched when every filter has a group', () => {
    const recordFilters = [
      buildRecordFilter({
        id: 'filter-id',
        recordFilterGroupId: 'root-group-id',
      }),
    ];
    const recordFilterGroups = [andRootRecordFilterGroup];

    const result = attachUngroupedRecordFiltersToRootRecordFilterGroup({
      recordFilters,
      recordFilterGroups,
    });

    expect(result.recordFilters).toBe(recordFilters);
    expect(result.recordFilterGroups).toBe(recordFilterGroups);
  });

  it('should append ungrouped filters after the children of an AND root group', () => {
    const result = attachUngroupedRecordFiltersToRootRecordFilterGroup({
      recordFilters: [
        buildRecordFilter({
          id: 'grouped-filter-id',
          recordFilterGroupId: 'root-group-id',
          positionInRecordFilterGroup: 1,
        }),
        buildRecordFilter({ id: 'ungrouped-filter-id' }),
      ],
      recordFilterGroups: [
        andRootRecordFilterGroup,
        {
          id: 'child-group-id',
          parentRecordFilterGroupId: 'root-group-id',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
          positionInRecordFilterGroup: 0,
        },
      ],
    });

    expect(result.recordFilters[1]).toEqual(
      buildRecordFilter({
        id: 'ungrouped-filter-id',
        recordFilterGroupId: 'root-group-id',
        positionInRecordFilterGroup: 2,
      }),
    );
    expect(result.recordFilterGroups).toHaveLength(2);
  });

  it('should create an AND root group when there is none', () => {
    const result = attachUngroupedRecordFiltersToRootRecordFilterGroup({
      recordFilters: [
        buildRecordFilter({ id: 'first-filter-id' }),
        buildRecordFilter({ id: 'second-filter-id' }),
      ],
      recordFilterGroups: [],
    });

    const [rootRecordFilterGroup] = result.recordFilterGroups;

    expect(result.recordFilterGroups).toEqual([
      {
        id: expect.any(String),
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
      },
    ]);
    expect(
      result.recordFilters.map(
        ({ recordFilterGroupId, positionInRecordFilterGroup }) => ({
          recordFilterGroupId,
          positionInRecordFilterGroup,
        }),
      ),
    ).toEqual([
      {
        recordFilterGroupId: rootRecordFilterGroup.id,
        positionInRecordFilterGroup: 0,
      },
      {
        recordFilterGroupId: rootRecordFilterGroup.id,
        positionInRecordFilterGroup: 1,
      },
    ]);
  });

  it('should nest an OR root group under a new AND root so ungrouped filters stay ANDed with it', () => {
    const result = attachUngroupedRecordFiltersToRootRecordFilterGroup({
      recordFilters: [
        buildRecordFilter({
          id: 'grouped-filter-id',
          recordFilterGroupId: 'root-group-id',
        }),
        buildRecordFilter({ id: 'ungrouped-filter-id' }),
      ],
      recordFilterGroups: [
        {
          id: 'root-group-id',
          logicalOperator: RecordFilterGroupLogicalOperator.OR,
        },
      ],
    });

    const [newRootRecordFilterGroup, previousRootRecordFilterGroup] =
      result.recordFilterGroups;

    expect(newRootRecordFilterGroup).toEqual({
      id: expect.any(String),
      logicalOperator: RecordFilterGroupLogicalOperator.AND,
    });
    expect(previousRootRecordFilterGroup).toEqual({
      id: 'root-group-id',
      logicalOperator: RecordFilterGroupLogicalOperator.OR,
      parentRecordFilterGroupId: newRootRecordFilterGroup.id,
      positionInRecordFilterGroup: 0,
    });
    expect(result.recordFilters).toEqual([
      buildRecordFilter({
        id: 'grouped-filter-id',
        recordFilterGroupId: 'root-group-id',
      }),
      buildRecordFilter({
        id: 'ungrouped-filter-id',
        recordFilterGroupId: newRootRecordFilterGroup.id,
        positionInRecordFilterGroup: 1,
      }),
    ]);
  });

  it('should leave filters and groups untouched when nesting an OR root would add a third group level', () => {
    const recordFilters = [buildRecordFilter({ id: 'ungrouped-filter-id' })];
    const recordFilterGroups: RecordFilterGroup[] = [
      {
        id: 'root-group-id',
        logicalOperator: RecordFilterGroupLogicalOperator.OR,
      },
      {
        id: 'child-group-id',
        parentRecordFilterGroupId: 'root-group-id',
        logicalOperator: RecordFilterGroupLogicalOperator.AND,
        positionInRecordFilterGroup: 0,
      },
    ];

    const result = attachUngroupedRecordFiltersToRootRecordFilterGroup({
      recordFilters,
      recordFilterGroups,
    });

    expect(result.recordFilters).toBe(recordFilters);
    expect(result.recordFilterGroups).toBe(recordFilterGroups);
  });
});
