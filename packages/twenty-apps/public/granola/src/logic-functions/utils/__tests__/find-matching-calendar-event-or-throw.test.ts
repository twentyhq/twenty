import { type CoreApiClient } from 'twenty-client-sdk/core';
import { describe, expect, it, vi } from 'vitest';

import { buildGranolaNote } from 'src/__tests__/utils/build-granola-note.util';
import { findMatchingCalendarEventOrThrow } from 'src/logic-functions/utils/find-matching-calendar-event-or-throw.util';

const buildConnection = (
  calendarEventIds: (string | null)[],
  hasNextPage = false,
) => ({
  edges: calendarEventIds.map((calendarEventId) => ({
    node: { calendarEventId },
  })),
  pageInfo: { hasNextPage },
});

const buildCoreApiClient = ({
  associations,
  participants,
}: {
  associations?: ReturnType<typeof buildConnection>;
  participants?: ReturnType<typeof buildConnection>;
}): Pick<CoreApiClient, 'query'> => ({
  query: vi
    .fn()
    .mockImplementation(async (query: object) =>
      'calendarChannelEventAssociations' in query
        ? { calendarChannelEventAssociations: associations }
        : { calendarEventParticipants: participants },
    ),
});

const buildNote = (
  overrides: Partial<
    NonNullable<ReturnType<typeof buildGranolaNote>['calendar_event']>
  > = {},
) =>
  buildGranolaNote({
    calendar_event: {
      event_title: 'Customer call',
      invitees: [{ email: 'Ada@Example.com ' }, { email: 'bob@example.com' }],
      organiser: null,
      calendar_event_id: null,
      scheduled_start_time: '2026-09-05T10:00:00Z',
      scheduled_end_time: null,
      ...overrides,
    },
  });

describe('findMatchingCalendarEventOrThrow', () => {
  it('links by the provider event id without touching participants', async () => {
    const coreApiClient = buildCoreApiClient({
      associations: buildConnection(['event-1', 'event-1']),
    });

    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient,
        note: buildNote({ calendar_event_id: 'google-123' }),
      }),
    ).resolves.toBe('event-1');
    expect(coreApiClient.query).toHaveBeenCalledTimes(1);
  });

  it('refuses an ambiguous or paged-out provider id match', async () => {
    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient: buildCoreApiClient({
          associations: buildConnection(['event-1', 'event-2']),
        }),
        note: buildNote({ calendar_event_id: 'google-123' }),
      }),
    ).resolves.toBeUndefined();
    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient: buildCoreApiClient({
          associations: buildConnection(['event-1'], true),
        }),
        note: buildNote({ calendar_event_id: 'google-123' }),
      }),
    ).resolves.toBeUndefined();
  });

  it('falls back to invitee emails at the scheduled start when no provider id matches', async () => {
    const coreApiClient = buildCoreApiClient({
      associations: buildConnection([]),
      participants: buildConnection(['event-7', null, 'event-7']),
    });

    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient,
        note: buildNote({ calendar_event_id: 'google-123' }),
      }),
    ).resolves.toBe('event-7');
    expect(coreApiClient.query).toHaveBeenCalledTimes(2);
    expect(vi.mocked(coreApiClient.query).mock.calls[1][0]).toMatchObject({
      calendarEventParticipants: {
        __args: {
          filter: {
            calendarEvent: { startsAt: { eq: '2026-09-05T10:00:00Z' } },
            or: [
              { handle: { ilike: 'Ada@Example.com' } },
              { handle: { ilike: 'bob@example.com' } },
            ],
          },
        },
      },
    });
  });

  it('escapes ilike wildcards in invitee emails', async () => {
    const coreApiClient = buildCoreApiClient({
      participants: buildConnection([]),
    });

    await findMatchingCalendarEventOrThrow({
      coreApiClient,
      note: buildNote({ invitees: [{ email: 'a_b%c@example.com' }] }),
    });

    expect(vi.mocked(coreApiClient.query).mock.calls[0][0]).toMatchObject({
      calendarEventParticipants: {
        __args: {
          filter: { or: [{ handle: { ilike: 'a\\_b\\%c@example.com' } }] },
        },
      },
    });
  });

  it('does not query without a scheduled start or invitees', async () => {
    const coreApiClient = buildCoreApiClient({});

    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient,
        note: buildNote({ scheduled_start_time: null }),
      }),
    ).resolves.toBeUndefined();
    await expect(
      findMatchingCalendarEventOrThrow({
        coreApiClient,
        note: buildNote({ invitees: [] }),
      }),
    ).resolves.toBeUndefined();
    expect(coreApiClient.query).not.toHaveBeenCalled();
  });
});
