import { describe, expect, it, vi } from 'vitest';

import { CallRecorderPreference } from 'src/constants/call-recorder-preference';
import { markCalendarEventsRecordingOn } from 'src/logic-functions/data/mark-calendar-events-recording-on.util';

type UpdateCalendarEventsMutationArgument = {
  updateCalendarEvents: { __args: { filter: { id: { in: string[] } } } };
};

const CALENDAR_EVENT_IDS = Array.from(
  { length: 201 },
  (_, index) => `calendar-event-${String(index + 1).padStart(3, '0')}`,
);

describe('markCalendarEventsRecordingOn', () => {
  it('marks blank calendar events in batches of 100', async () => {
    const mutation = vi.fn(
      async (mutationArgument: UpdateCalendarEventsMutationArgument) => ({
        updateCalendarEvents:
          mutationArgument.updateCalendarEvents.__args.filter.id.in.map(
            (id) => ({ id }),
          ),
      }),
    );

    const markedCalendarEventCount = await markCalendarEventsRecordingOn(
      { mutation } as never,
      CALENDAR_EVENT_IDS,
    );

    expect(markedCalendarEventCount).toBe(201);
    expect(mutation).toHaveBeenCalledTimes(3);
    expect(mutation.mock.calls[0]?.[0].updateCalendarEvents.__args).toEqual({
      filter: {
        id: { in: CALENDAR_EVENT_IDS.slice(0, 100) },
        callRecorderPreference: { is: 'NULL' },
      },
      data: { callRecorderPreference: CallRecorderPreference.ON },
    });
  });

  it('attempts later batches before surfacing an earlier batch failure', async () => {
    const mutation = vi
      .fn()
      .mockResolvedValueOnce({ updateCalendarEvents: [] })
      .mockRejectedValueOnce(new Error('Second batch failed'))
      .mockResolvedValueOnce({ updateCalendarEvents: [] });

    await expect(
      markCalendarEventsRecordingOn({ mutation } as never, CALENDAR_EVENT_IDS),
    ).rejects.toThrow(
      '1 of 3 calendar event preference batches failed: Second batch failed',
    );
    expect(mutation).toHaveBeenCalledTimes(3);
  });
});
