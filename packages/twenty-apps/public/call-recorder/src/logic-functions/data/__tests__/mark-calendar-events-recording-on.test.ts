import { describe, expect, it, vi } from 'vitest';

import { CALENDAR_EVENT_UPDATE_BATCH_SIZE } from 'src/logic-functions/constants/calendar-event-update-batch-size';
import { markCalendarEventsRecordingOn } from 'src/logic-functions/data/mark-calendar-events-recording-on.util';

type UpdateCalendarEventsMutationArguments = {
  filter: {
    id: { in: string[] };
    callRecorderPreference: { is: string };
  };
  data: { callRecorderPreference: string };
};

type UpdateCalendarEventsMutation = {
  updateCalendarEvents: {
    __args: UpdateCalendarEventsMutationArguments;
  };
};

describe('markCalendarEventsRecordingOn', () => {
  it('writes ON to blank preferences only, in batches of the update batch size, deduplicating ids', async () => {
    const capturedMutationArguments: UpdateCalendarEventsMutationArguments[] =
      [];
    const mutation = vi.fn(
      async (mutationArgument: UpdateCalendarEventsMutation) => {
        const updateCalendarEventsArguments =
          mutationArgument.updateCalendarEvents.__args;

        capturedMutationArguments.push(updateCalendarEventsArguments);

        return {
          updateCalendarEvents: updateCalendarEventsArguments.filter.id.in.map(
            (id) => ({ id }),
          ),
        };
      },
    );
    const calendarEventIds = Array.from(
      { length: CALENDAR_EVENT_UPDATE_BATCH_SIZE + 1 },
      (_, index) => `calendar-event-${String(index + 1).padStart(4, '0')}`,
    );

    const markedCalendarEventCount = await markCalendarEventsRecordingOn(
      { mutation } as never,
      [...calendarEventIds, calendarEventIds[0]],
    );

    expect(markedCalendarEventCount).toBe(CALENDAR_EVENT_UPDATE_BATCH_SIZE + 1);
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(capturedMutationArguments[0]?.filter).toEqual({
      id: { in: calendarEventIds.slice(0, CALENDAR_EVENT_UPDATE_BATCH_SIZE) },
      callRecorderPreference: { is: 'NULL' },
    });
    expect(capturedMutationArguments[1]?.filter).toEqual({
      id: { in: calendarEventIds.slice(CALENDAR_EVENT_UPDATE_BATCH_SIZE) },
      callRecorderPreference: { is: 'NULL' },
    });
    expect(capturedMutationArguments[0]?.data).toEqual({
      callRecorderPreference: 'ON',
    });
  });

  it('returns zero without issuing a mutation when no id is provided', async () => {
    const mutation = vi.fn(async () => ({ updateCalendarEvents: [] }));

    expect(await markCalendarEventsRecordingOn({ mutation } as never, [])).toBe(
      0,
    );
    expect(mutation).not.toHaveBeenCalled();
  });
});
