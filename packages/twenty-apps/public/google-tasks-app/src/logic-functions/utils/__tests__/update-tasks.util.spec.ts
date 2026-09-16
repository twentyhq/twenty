import { describe, expect, it } from 'vitest';
import { groupUpdates } from 'src/logic-functions/utils/update-tasks.util';
import { TASKS_BATCH_SIZE } from 'src/constants/sync';

describe('groupUpdates', () => {
  it('returns nothing for an empty plan', () => {
    expect(groupUpdates([])).toEqual([]);
  });

  it('collapses tasks that changed the same way into one operation', () => {
    const operations = groupUpdates([
      { id: 'a', fields: { status: 'DONE' } },
      { id: 'b', fields: { status: 'DONE' } },
      { id: 'c', fields: { status: 'DONE' } },
    ]);

    expect(operations).toEqual([
      { fields: { status: 'DONE' }, ids: ['a', 'b', 'c'] },
    ]);
  });

  it('keeps tasks with different diffs in separate operations', () => {
    const operations = groupUpdates([
      { id: 'a', fields: { status: 'DONE' } },
      { id: 'b', fields: { title: 'Renamed' } },
    ]);

    expect(operations).toHaveLength(2);
    expect(operations).toContainEqual({ fields: { status: 'DONE' }, ids: ['a'] });
    expect(operations).toContainEqual({ fields: { title: 'Renamed' }, ids: ['b'] });
  });

  it('groups on the whole payload, not just one field', () => {
    const operations = groupUpdates([
      { id: 'a', fields: { status: 'DONE', title: 'Same' } },
      { id: 'b', fields: { status: 'DONE', title: 'Different' } },
    ]);

    expect(operations).toHaveLength(2);
  });

  it('splits a group larger than the mutation batch limit', () => {
    const taskUpdates = Array.from({ length: TASKS_BATCH_SIZE + 5 }, (_, index) => ({
      id: `task-${index}`,
      fields: { status: 'DONE' as const },
    }));

    const operations = groupUpdates(taskUpdates);

    expect(operations).toHaveLength(2);
    expect(operations[0].ids).toHaveLength(TASKS_BATCH_SIZE);
    expect(operations[1].ids).toHaveLength(5);
  });
});
