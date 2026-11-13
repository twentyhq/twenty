import { getScopedRelationAffectedParentRecordIds } from '@/object-record/record-column-scope/utils/getScopedRelationAffectedParentRecordIds';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';

const parentRecords: Record<string, ObjectRecord> = {
  'deal-1': {
    id: 'deal-1',
    __typename: 'Deal',
    scope_a: [{ id: 'item-1', __typename: 'ActionItem' }],
  },
  'deal-2': { id: 'deal-2', __typename: 'Deal', scope_a: [] },
  'deal-3': { id: 'deal-3', __typename: 'Deal', scope_a: [] },
};

const getAffectedParentRecordIds = (operation: ObjectRecordOperation) =>
  getScopedRelationAffectedParentRecordIds({
    operation,
    parentRecordIds: Object.keys(parentRecords),
    getParentRecord: (parentRecordId) => parentRecords[parentRecordId],
    aliases: ['scope_a'],
    joinColumnNames: ['dealId'],
  });

describe('getScopedRelationAffectedParentRecordIds', () => {
  it.each<{
    title: string;
    operation: ObjectRecordOperation;
    expected: string[];
  }>([
    {
      title: 'the parent listing an updated record and the parent it moved to',
      operation: {
        type: 'update-one',
        result: {
          updateInput: {
            recordId: 'item-1',
            updatedFields: [{ dealId: 'deal-2' }],
          },
        },
      },
      expected: ['deal-1', 'deal-2'],
    },
    {
      title: 'the parent of a created record',
      operation: {
        type: 'create-one',
        createdRecord: {
          id: 'item-9',
          __typename: 'ActionItem',
          dealId: 'deal-3',
        },
      },
      expected: ['deal-3'],
    },
    {
      title: 'the parent listing a deleted record',
      operation: { type: 'delete-one', deletedRecordId: 'item-1' },
      expected: ['deal-1'],
    },
    {
      title:
        'every parent when the operation does not say which records changed',
      operation: { type: 'create-many' },
      expected: ['deal-1', 'deal-2', 'deal-3'],
    },
  ])('returns $title', ({ operation, expected }) => {
    expect(getAffectedParentRecordIds(operation)).toEqual(expected);
  });
});
