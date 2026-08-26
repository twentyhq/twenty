import {
  getActivityFromTarget,
  getActivityIdFromTarget,
  getActivityTargetsFromRecord,
} from '@/activities/utils/getActivityTargetRecordValues';

const task = {
  id: 'task-id',
  __typename: 'Task' as const,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  title: 'Task',
};

const taskTarget = {
  id: 'task-target-id',
  __typename: 'TaskTarget',
  task,
  taskId: task.id,
};

describe('activity target record values', () => {
  it('reads a metadata-named target collection', () => {
    expect(
      getActivityTargetsFromRecord({
        record: { customTargets: [taskTarget, null, { invalid: true }] },
        fieldName: 'customTargets',
      }),
    ).toEqual([taskTarget]);
  });

  it('reads a nested activity through its metadata-named relation', () => {
    expect(
      getActivityFromTarget({
        activityTarget: taskTarget,
        relationFieldName: 'task',
      }),
    ).toEqual(task);
  });

  it('prefers the direct foreign key when the nested activity is absent', () => {
    expect(
      getActivityIdFromTarget({
        activityTarget: {
          id: taskTarget.id,
          __typename: taskTarget.__typename,
          taskId: task.id,
        },
        relationFieldName: 'task',
        relationFieldIdName: 'taskId',
      }),
    ).toBe(task.id);
  });
});
