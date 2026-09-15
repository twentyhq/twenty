import { describe, expect, it } from 'vitest';
import { buildGoogleTaskPayload } from 'src/logic-functions/utils/build-google-task-payload.util';
import { type TaskNode } from 'src/logic-functions/types/types';

const task = (overrides: Partial<TaskNode> = {}): TaskNode => ({
  id: 'twenty-1',
  title: 'Buy milk',
  status: 'TODO',
  dueAt: null,
  ...overrides,
});

describe('buildGoogleTaskPayload', () => {
  it('maps a task onto the Google Tasks shape', () => {
    expect(
      buildGoogleTaskPayload(
        task({
          bodyV2: { markdown: 'from the corner shop' },
          dueAt: '2026-09-01T12:00:00.000Z',
        }),
      ),
    ).toEqual({
      title: 'Buy milk',
      notes: 'from the corner shop',
      due: '2026-09-01T00:00:00.000Z',
      status: 'needsAction',
    });
  });

  it('marks a DONE task as completed', () => {
    expect(buildGoogleTaskPayload(task({ status: 'DONE' })).status).toBe(
      'completed',
    );
  });

  it('treats any other Twenty status as incomplete', () => {
    expect(buildGoogleTaskPayload(task({ status: 'IN_PROGRESS' })).status).toBe(
      'needsAction',
    );
  });

  it('clears a due date the task no longer has', () => {
    expect(buildGoogleTaskPayload(task()).due).toBeNull();
  });

  it('keeps the day when the due date is stored at noon UTC', () => {
    expect(
      buildGoogleTaskPayload(task({ dueAt: '2026-09-01T12:00:00.000Z' })).due,
    ).toBe('2026-09-01T00:00:00.000Z');
  });

  it('clears notes with the empty string Google expects', () => {
    expect(
      buildGoogleTaskPayload(task({ bodyV2: { markdown: '' } })).notes,
    ).toBe('');
  });

  it('clears notes the task never had', () => {
    expect(buildGoogleTaskPayload(task()).notes).toBe('');
  });

  it('falls back to an empty title', () => {
    expect(buildGoogleTaskPayload(task({ title: undefined })).title).toBe('');
  });
});
