import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { getLastChildPositionInRecordFilterGroup } from '@/object-record/record-filter-group/utils/getLastChildPositionInRecordFilterGroup';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RecordFilterOperand } from '@/object-record/record-filter/types/RecordFilterOperand';

const buildRecordFilter = ({
  id,
  recordFilterGroupId,
  positionInRecordFilterGroup,
}: {
  id: string;
  recordFilterGroupId: string;
  positionInRecordFilterGroup?: number | null;
}): RecordFilter => ({
  id,
  recordFilterGroupId,
  positionInRecordFilterGroup,
  fieldMetadataId: 'field-id',
  operand: RecordFilterOperand.CONTAINS,
  value: '',
  displayValue: '',
  label: 'Name',
  type: 'TEXT',
});

const buildRecordFilterGroup = ({
  id,
  parentRecordFilterGroupId,
  positionInRecordFilterGroup,
}: {
  id: string;
  parentRecordFilterGroupId: string | null;
  positionInRecordFilterGroup?: number | null;
}): RecordFilterGroup => ({
  id,
  parentRecordFilterGroupId,
  positionInRecordFilterGroup,
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
});

describe('getLastChildPositionInRecordFilterGroup', () => {
  it('returns the highest position among child filters and child groups', () => {
    const result = getLastChildPositionInRecordFilterGroup({
      recordFilterGroupId: 'root',
      recordFilters: [
        buildRecordFilter({
          id: 'filter-1',
          recordFilterGroupId: 'root',
          positionInRecordFilterGroup: 1,
        }),
        buildRecordFilter({
          id: 'other-group-filter',
          recordFilterGroupId: 'other',
          positionInRecordFilterGroup: 9,
        }),
      ],
      recordFilterGroups: [
        buildRecordFilterGroup({ id: 'root', parentRecordFilterGroupId: null }),
        buildRecordFilterGroup({
          id: 'child',
          parentRecordFilterGroupId: 'root',
          positionInRecordFilterGroup: 3,
        }),
      ],
    });

    expect(result).toBe(3);
  });

  it('treats missing positions as zero and returns zero for an empty group', () => {
    expect(
      getLastChildPositionInRecordFilterGroup({
        recordFilterGroupId: 'root',
        recordFilters: [
          buildRecordFilter({ id: 'filter-1', recordFilterGroupId: 'root' }),
        ],
        recordFilterGroups: [],
      }),
    ).toBe(0);

    expect(
      getLastChildPositionInRecordFilterGroup({
        recordFilterGroupId: 'root',
        recordFilters: [],
        recordFilterGroups: [],
      }),
    ).toBe(0);
  });
});
