import { describe, expect, it, vi } from 'vitest';

import { clearCallRecorderPreferences } from 'src/logic-functions/data/clear-call-recorder-preferences.util';

describe('clearCallRecorderPreferences', () => {
  it('clears only the default ON in batches of at most 100 unique ids', async () => {
    const capturedMutationArguments: Array<{ filter: unknown; data: unknown }> =
      [];
    const mutation = vi.fn(async (mutationArgument: any) => {
      const updateCalendarEventsArguments =
        mutationArgument.updateCalendarEvents.__args;

      capturedMutationArguments.push(updateCalendarEventsArguments);

      return {
        updateCalendarEvents: updateCalendarEventsArguments.filter.id.in.map(
          (id: string) => ({ id }),
        ),
      };
    });
    const calendarEventIds = Array.from(
      { length: 101 },
      (_, index) => `calendar-event-${String(index + 1).padStart(3, '0')}`,
    );

    const clearedCalendarEventCount = await clearCallRecorderPreferences(
      { mutation } as never,
      [...calendarEventIds, calendarEventIds[0]],
    );

    expect(clearedCalendarEventCount).toBe(101);
    expect(mutation).toHaveBeenCalledTimes(2);
    expect(capturedMutationArguments[0]?.filter).toEqual({
      id: { in: calendarEventIds.slice(0, 100) },
      callRecorderPreference: { eq: 'ON' },
    });
    expect(capturedMutationArguments[1]?.filter).toEqual({
      id: { in: calendarEventIds.slice(100) },
      callRecorderPreference: { eq: 'ON' },
    });
    expect(capturedMutationArguments[0]?.data).toEqual({
      callRecorderPreference: null,
    });
  });

  it('returns zero without issuing a mutation when no id is provided', async () => {
    const mutation = vi.fn(async () => ({ updateCalendarEvents: [] }));

    expect(await clearCallRecorderPreferences({ mutation } as never, [])).toBe(
      0,
    );
    expect(mutation).not.toHaveBeenCalled();
  });
});
