import { describe, expect, it } from 'vitest';
import { partitionTasks } from 'src/logic-functions/utils/build-sync-plan.util';
import { type GoogleTask, TaskNode } from 'src/logic-functions/types/types';

const googleTask = (overrides: Partial<GoogleTask> = {}): GoogleTask => ({
  id: 'google-1',
  title: 'Buy milk',
  updated: '2026-08-30T10:00:00.000Z',
  ...overrides,
});

const existingTask = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'twenty-1',
  googleTasksId: 'google-1',
  title: 'Buy milk',
  status: 'TODO',
  dueAt: null,
  deletedAt: null,
  ...overrides,
});

describe('partitionTasks', () => {
  it('creates tasks that have no counterpart in Twenty', () => {
    const plan = partitionTasks([googleTask()], []);

    expect(plan.tasksToCreate).toHaveLength(1);
    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('does not create a task that is already deleted upstream', () => {
    const plan = partitionTasks([googleTask({ deleted: true })], []);

    expect(plan.tasksToCreate).toHaveLength(0);
  });

  it('keeps a matched task that was deleted upstream, untouched', () => {
    const plan = partitionTasks(
      [googleTask({ deleted: true, title: 'Renamed before deletion' })],
      [existingTask({ id: 'twenty-42' })],
    );

    expect(plan.tasksToCreate).toHaveLength(0);
    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('leaves an unchanged task alone', () => {
    const plan = partitionTasks([googleTask()], [existingTask()]);

    expect(plan.tasksToCreate).toHaveLength(0);
    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('updates a task whose title changed', () => {
    const plan = partitionTasks(
      [googleTask({ title: 'Buy oat milk' })],
      [existingTask()],
    );

    expect(plan.tasksToUpdate).toHaveLength(1);
  });

  it('carries the Twenty record id and only the diverged fields', () => {
    const plan = partitionTasks(
      [googleTask({ title: 'Buy oat milk' })],
      [existingTask({ id: 'twenty-42' })],
    );

    expect(plan.tasksToUpdate[0]).toEqual({
      id: 'twenty-42',
      fields: { title: 'Buy oat milk' },
    });
  });

  it('emits every diverged field together', () => {
    const plan = partitionTasks(
      [
        googleTask({
          title: 'Buy oat milk',
          notes: 'from the corner shop',
          due: '2026-09-01T00:00:00.000Z',
          completed: '2026-08-31T09:00:00.000Z',
        }),
      ],
      [existingTask()],
    );

    expect(plan.tasksToUpdate[0].fields).toEqual({
      title: 'Buy oat milk',
      bodyV2: { markdown: 'from the corner shop' },
      dueAt: '2026-09-01T12:00:00.000Z',
      status: 'DONE',
    });
  });

  it('clears a field that was emptied upstream', () => {
    const plan = partitionTasks(
      [googleTask()],
      [existingTask({ bodyV2: { markdown: 'stale note' } })],
    );

    expect(plan.tasksToUpdate[0].fields).toEqual({ bodyV2: { markdown: null } });
  });

  it('updates a task whose notes changed', () => {
    const plan = partitionTasks(
      [googleTask({ notes: 'from the corner shop' })],
      [existingTask({ bodyV2: { markdown: undefined } })],
    );

    expect(plan.tasksToUpdate).toHaveLength(1);
  });

  it('leaves an IN_PROGRESS task alone while it is incomplete upstream', () => {
    const plan = partitionTasks(
      [googleTask()],
      [existingTask({ status: 'IN_PROGRESS' })],
    );

    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('updates an IN_PROGRESS task once it is completed upstream', () => {
    const plan = partitionTasks(
      [googleTask({ completed: '2026-08-30T11:00:00.000Z' })],
      [existingTask({ status: 'IN_PROGRESS' })],
    );

    expect(plan.tasksToUpdate).toHaveLength(1);
  });

  it('reopens a task that is DONE in Twenty but incomplete upstream', () => {
    const plan = partitionTasks([googleTask()], [existingTask({ status: 'DONE' })]);

    expect(plan.tasksToUpdate).toHaveLength(1);
  });

  it('treats due dates that differ only in serialization as equal', () => {
    const plan = partitionTasks(
      [googleTask({ due: '2026-09-01T00:00:00.000Z' })],
      [existingTask({ dueAt: '2026-09-01T12:00:00Z' })],
    );

    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('updates a task whose due date actually moved', () => {
    const plan = partitionTasks(
      [googleTask({ due: '2026-09-02T00:00:00.000Z' })],
      [existingTask({ dueAt: '2026-09-01T12:00:00.000Z' })],
    );

    expect(plan.tasksToUpdate).toHaveLength(1);
  });

  it('moves a due date still stored at midnight to noon on the same day', () => {
    const plan = partitionTasks(
      [googleTask({ due: '2026-09-01T00:00:00.000Z' })],
      [existingTask({ dueAt: '2026-09-01T00:00:00.000Z' })],
    );

    expect(plan.tasksToUpdate[0].fields).toEqual({
      dueAt: '2026-09-01T12:00:00.000Z',
    });
  });

  it('never resurrects a task that was soft-deleted in Twenty', () => {
    const plan = partitionTasks(
      [googleTask({ title: 'Buy oat milk' })],
      [existingTask({ deletedAt: '2026-08-29T10:00:00.000Z' })],
    );

    expect(plan.tasksToCreate).toHaveLength(0);
    expect(plan.tasksToUpdate).toHaveLength(0);
  });

  it('ignores Twenty tasks carrying no googleTasksId', () => {
    const plan = partitionTasks(
      [googleTask()],
      [existingTask({ googleTasksId: null })],
    );

    expect(plan.tasksToCreate).toHaveLength(1);
  });
});
