import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  reconcileCallRecorderForCalendarEventIds: vi.fn(),
}));

vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: class CoreApiClient {},
}));

vi.mock('src/logic-functions/flows/reconcile-call-recorder.util', () => ({
  reconcileCallRecorderForCalendarEventIds:
    mocks.reconcileCallRecorderForCalendarEventIds,
}));

import reconcileCalendarEventLogicFunction from 'src/logic-functions/reconcile-call-recorder-calendar-event';

const handler = reconcileCalendarEventLogicFunction.config.handler as (
  event: unknown,
) => Promise<object | undefined>;

const buildUpdatedEvent = ({
  updatedFields,
  before,
  after,
}: {
  updatedFields: string[];
  before: Record<string, unknown>;
  after: Record<string, unknown>;
}) => ({
  name: 'calendarEvent.updated',
  recordId: 'calendar-event-1',
  properties: {
    updatedFields,
    before: { id: 'calendar-event-1', ...before },
    after: { id: 'calendar-event-1', ...after },
  },
});

describe('reconcile-call-recorder-calendar-event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.reconcileCallRecorderForCalendarEventIds.mockResolvedValue([]);
  });

  it('skips the echo of the app clearing the default preference', async () => {
    const result = await handler(
      buildUpdatedEvent({
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: 'ON' },
        after: { callRecorderPreference: null },
      }),
    );

    expect(
      mocks.reconcileCallRecorderForCalendarEventIds,
    ).not.toHaveBeenCalled();
    expect(result).toEqual({
      skipped: true,
      reason: 'no relevant calendar event change',
    });
  });

  it('reconciles when a user clears an OFF preference', async () => {
    await handler(
      buildUpdatedEvent({
        updatedFields: ['callRecorderPreference'],
        before: { callRecorderPreference: 'OFF' },
        after: { callRecorderPreference: null },
      }),
    );

    expect(mocks.reconcileCallRecorderForCalendarEventIds).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
  });

  it('reconciles when the preference is cleared together with another relevant field', async () => {
    await handler(
      buildUpdatedEvent({
        updatedFields: ['callRecorderPreference', 'title'],
        before: { callRecorderPreference: 'ON' },
        after: { callRecorderPreference: null },
      }),
    );

    expect(mocks.reconcileCallRecorderForCalendarEventIds).toHaveBeenCalledWith(
      expect.objectContaining({ calendarEventIds: ['calendar-event-1'] }),
    );
  });
});
