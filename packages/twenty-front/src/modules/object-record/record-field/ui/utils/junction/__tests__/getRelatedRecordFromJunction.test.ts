import { getRelatedRecordFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordFromJunction';
import { getRelatedRecordIdFromJunction } from '@/object-record/record-field/ui/utils/junction/getRelatedRecordIdFromJunction';

describe('getRelatedRecordFromJunction', () => {
  it('reads a nested related record by field name', () => {
    expect(
      getRelatedRecordFromJunction(
        {
          task: { id: 'task-1', title: 'Follow up' },
        },
        'task',
      ),
    ).toEqual({ id: 'task-1', title: 'Follow up' });
  });

  it('returns undefined when the nested record is missing', () => {
    expect(getRelatedRecordFromJunction({}, 'task')).toBeUndefined();
    expect(
      getRelatedRecordFromJunction({ task: 'task-1' }, 'task'),
    ).toBeUndefined();
  });
});

describe('getRelatedRecordIdFromJunction', () => {
  it('prefers the join column when both the join column and nested record exist', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: {
          taskId: 'task-from-join-column',
          task: { id: 'task-from-nested-record' },
        },
        relationFieldName: 'task',
      }),
    ).toBe('task-from-join-column');
  });

  it('uses the join column when the nested relation is missing', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: { taskId: 'task-1' },
        relationFieldName: 'task',
      }),
    ).toBe('task-1');
  });

  it('falls back to the nested related record id', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: { task: { id: 'task-2' } },
        relationFieldName: 'task',
      }),
    ).toBe('task-2');
  });

  it('returns undefined when neither the join column nor nested record is present', () => {
    expect(
      getRelatedRecordIdFromJunction({
        junctionRecord: {},
        relationFieldName: 'task',
      }),
    ).toBeUndefined();
  });
});
