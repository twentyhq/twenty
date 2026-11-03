import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { getAllRecordFilterGroupDescendantsOfRecordFilterGroup } from '@/object-record/record-filter-group/utils/getAllRecordFilterGroupDescendantsOfRecordFilterGroup';

const buildRecordFilterGroup = ({
  id,
  parentRecordFilterGroupId,
}: {
  id: string;
  parentRecordFilterGroupId: string | null;
}): RecordFilterGroup => ({
  id,
  parentRecordFilterGroupId,
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
});

describe('getAllRecordFilterGroupDescendantsOfRecordFilterGroup', () => {
  it('returns child and grandchild groups but not siblings or the group itself', () => {
    const recordFilterGroups = [
      buildRecordFilterGroup({ id: 'root', parentRecordFilterGroupId: null }),
      buildRecordFilterGroup({
        id: 'child',
        parentRecordFilterGroupId: 'root',
      }),
      buildRecordFilterGroup({
        id: 'grandchild',
        parentRecordFilterGroupId: 'child',
      }),
      buildRecordFilterGroup({
        id: 'sibling',
        parentRecordFilterGroupId: null,
      }),
      buildRecordFilterGroup({
        id: 'sibling-child',
        parentRecordFilterGroupId: 'sibling',
      }),
    ];

    const result = getAllRecordFilterGroupDescendantsOfRecordFilterGroup({
      recordFilterGroupId: 'root',
      recordFilterGroups,
    });

    expect(result.map(({ id }) => id)).toEqual(['child', 'grandchild']);
  });

  it('returns an empty array for a group without children', () => {
    const result = getAllRecordFilterGroupDescendantsOfRecordFilterGroup({
      recordFilterGroupId: 'leaf',
      recordFilterGroups: [
        buildRecordFilterGroup({ id: 'leaf', parentRecordFilterGroupId: null }),
      ],
    });

    expect(result).toEqual([]);
  });
});
