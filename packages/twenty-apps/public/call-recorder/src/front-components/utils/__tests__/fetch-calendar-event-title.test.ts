import { describe, expect, it, vi } from 'vitest';

import { fetchCalendarEventTitle } from 'src/front-components/utils/fetch-calendar-event-title.util';

const buildClient = (title: string | null | undefined, isFound = true) => ({
  query: vi.fn().mockResolvedValue({
    calendarEvents: {
      edges: isFound ? [{ node: { id: 'calendar-event-1', title } }] : [],
    },
  }),
});

describe('fetchCalendarEventTitle', () => {
  it('returns the meeting title', async () => {
    const client = buildClient('  Weekly sync  ');

    expect(
      await fetchCalendarEventTitle({
        client,
        calendarEventId: 'calendar-event-1',
      }),
    ).toBe('Weekly sync');
    expect(client.query).toHaveBeenCalledWith({
      calendarEvents: {
        __args: { filter: { id: { eq: 'calendar-event-1' } }, first: 1 },
        edges: { node: { id: true, title: true } },
      },
    });
  });

  it.each([
    {
      case: 'the title is not shared with the reader',
      client: buildClient('FIELD_RESTRICTED_ADDITIONAL_PERMISSIONS_REQUIRED'),
    },
    { case: 'the title is empty', client: buildClient('   ') },
    { case: 'the title is missing', client: buildClient(null) },
    { case: 'the meeting is not found', client: buildClient(undefined, false) },
  ])('returns nothing when $case', async ({ client }) => {
    expect(
      await fetchCalendarEventTitle({
        client,
        calendarEventId: 'calendar-event-1',
      }),
    ).toBeUndefined();
  });
});
