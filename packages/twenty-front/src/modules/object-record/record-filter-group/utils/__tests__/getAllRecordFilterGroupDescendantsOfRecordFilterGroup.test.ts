import { RecordFilterGroupLogicalOperator } from 'twenty-shared/types';

import { type RecordFilterGroup } from '@/object-record/record-filter-group/types/RecordFilterGroup';
import { getAllRecordFilterGroupDescendantsOfRecordFilterGroup } from '@/object-record/record-filter-group/utils/getAllRecordFilterGroupDescendantsOfRecordFilterGroup';

const buildRecordFilterGroup = (
  id: string,
  parentRecordFilterGroupId: string | null,
): RecordFilterGroup => ({
  id,
  parentRecordFilterGroupId,
  logicalOperator: RecordFilterGroupLogicalOperator.AND,
});

describe('getAllRecordFilterGroupDescendantsOfRecordFilterGroup', () => {
  it('returns child and grandchild groups but not siblings or the group itself', () => {
    const recordFilterGroups = [
      buildRecordFilterGroup('root', null),
      buildRecordFilterGroup('child', 'root'),
      buildRecordFilterGroup('grandchild', 'child'),
      buildRecordFilterGroup('sibling', null),
      buildRecordFilterGroup('sibling-child', 'sibling'),
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
      recordFilterGroups: [buildRecordFilterGroup('leaf', null)],
    });

    expect(result).toEqual([]);
  });
});
