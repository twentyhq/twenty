import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';

describe('junction related record accessors', () => {
  it('reads a related record from a runtime-named relation', () => {
    expect(
      getRelatedRecordFromJunction({
        junctionRecord: { task: { id: 'task-1', title: 'Follow up' } },
        relationFieldName: 'task',
      }),
    ).toEqual({ id: 'task-1', title: 'Follow up' });
  });

  it('prefers the join column when the nested record is absent or stale', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: {
          taskId: 'task-from-join-column',
          task: { id: 'task-from-nested-record' },
        },
        relationFieldName: 'task',
        joinColumnName: 'taskId',
      }),
    ).toBe('task-from-join-column');
  });

  it('falls back to the nested related record id', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: { task: { id: 'task-2' } },
        relationFieldName: 'task',
        joinColumnName: 'taskId',
      }),
    ).toBe('task-2');
  });

  it('returns undefined for malformed junction records', () => {
    expect(
      getRelatedRecordFromJunction({
        junctionRecord: { task: 'task-1' },
        relationFieldName: 'task',
      }),
    ).toBeUndefined();
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: {},
        relationFieldName: 'task',
        joinColumnName: 'taskId',
      }),
    ).toBeUndefined();
  });
});
