import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { CoreApiClient } from 'twenty-client-sdk/core';

import { applyMeetingInteractions } from 'src/utils/apply-meeting-interactions';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const OTHER_PERSON_ID = '22222222-2222-2222-2222-222222222222';
const MEMBER_ID = '33333333-3333-3333-3333-333333333333';
const CALENDAR_EVENT_ID = '44444444-4444-4444-4444-444444444444';
const OLDER_CALENDAR_EVENT_ID = '55555555-5555-5555-5555-555555555555';
const NOW = '2026-06-12T12:00:00.000Z';
const PAST_EVENT_STARTS_AT = '2026-06-10T09:00:00.000Z';
const OLDER_EVENT_STARTS_AT = '2026-06-01T09:00:00.000Z';
const FUTURE_EVENT_STARTS_AT = '2026-06-20T09:00:00.000Z';

type Page = {
  edges: { node: Record<string, unknown> }[];
  pageInfo: { hasNextPage: boolean; endCursor: string | null };
};

const buildPage = (nodes: Record<string, unknown>[]): Page => ({
  edges: nodes.map((node) => ({ node })),
  pageInfo: { hasNextPage: false, endCursor: null },
});

const buildClient = (participants: Record<string, unknown>[] = []) => {
  const queryMock = vi.fn().mockImplementation((query) => {
    if (query.calendarEventParticipants) {
      return Promise.resolve({
        calendarEventParticipants: buildPage(participants),
      });
    }

    if (query.people) {
      const requestedIds: string[] = query.people.__args.filter.id.in;
      return Promise.resolve({
        people: buildPage(
          query.people.edges.node.companyId
            ? requestedIds.map((id) => ({ id, companyId: null }))
            : requestedIds.map((id) => ({ id })),
        ),
      });
    }

    if (query.companies) {
      return Promise.resolve({ companies: buildPage([]) });
    }

    return Promise.resolve({ opportunities: buildPage([]) });
  });
  const mutationMock = vi.fn().mockResolvedValue({});

  return {
    client: {
      query: queryMock,
      mutation: mutationMock,
    } as unknown as CoreApiClient,
    queryMock,
    mutationMock,
  };
};

const buildParticipant = ({
  calendarEventId,
  startsAt,
  isCanceled = false,
  isOrganizer = null,
  workspaceMemberId = null,
}: {
  calendarEventId: string;
  startsAt: string;
  isCanceled?: boolean;
  isOrganizer?: boolean | null;
  workspaceMemberId?: string | null;
}) => ({
  calendarEventId,
  isOrganizer,
  workspaceMemberId,
  calendarEvent: { startsAt, isCanceled },
});

const findPersonUpserts = (mutationMock: ReturnType<typeof vi.fn>) =>
  mutationMock.mock.calls.filter(([mutation]) => mutation.createPeople);

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(NOW));
});

afterEach(() => {
  vi.useRealTimers();
});

describe('applyMeetingInteractions', () => {
  it('resolves the whole batch through one participants query', async () => {
    const { client, queryMock } = buildClient();

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
      { personId: OTHER_PERSON_ID, calendarEventId: OLDER_CALENDAR_EVENT_ID },
    ]);

    expect(queryMock).toHaveBeenCalledTimes(1);
    expect(
      queryMock.mock.calls[0][0].calendarEventParticipants.__args.filter,
    ).toEqual({
      calendarEventId: { in: [CALENDAR_EVENT_ID, OLDER_CALENDAR_EVENT_ID] },
    });
  });

  it('sets lastContactAt, the organizer member and the calendarEvent item', async () => {
    const { client, mutationMock } = buildClient([
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
        workspaceMemberId: '66666666-6666-6666-6666-666666666666',
      }),
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
        isOrganizer: true,
        workspaceMemberId: MEMBER_ID,
      }),
    ]);

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
    ]);

    expect(findPersonUpserts(mutationMock)[0][0].createPeople.__args).toEqual({
      upsert: true,
      data: [
        {
          id: PERSON_ID,
          lastContactAt: PAST_EVENT_STARTS_AT,
          lastContactById: MEMBER_ID,
          lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
          lastContactItemMessageId: null,
          lastOutboundAt: PAST_EVENT_STARTS_AT,
          lastInboundAt: PAST_EVENT_STARTS_AT,
          lastMeetingId: CALENDAR_EVENT_ID,
        },
      ],
    });
  });

  it('writes every person of the batch in a single upsert', async () => {
    const { client, mutationMock } = buildClient([
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
      }),
      buildParticipant({
        calendarEventId: OLDER_CALENDAR_EVENT_ID,
        startsAt: OLDER_EVENT_STARTS_AT,
      }),
    ]);

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
      { personId: OTHER_PERSON_ID, calendarEventId: OLDER_CALENDAR_EVENT_ID },
    ]);

    const personUpserts = findPersonUpserts(mutationMock);

    expect(personUpserts).toHaveLength(1);
    expect(
      personUpserts[0][0].createPeople.__args.data.map(
        (record: { id: string }) => record.id,
      ),
    ).toEqual([PERSON_ID, OTHER_PERSON_ID]);
  });

  it('keeps only the most recent meeting when a person attended several in the batch', async () => {
    const { client, mutationMock } = buildClient([
      buildParticipant({
        calendarEventId: OLDER_CALENDAR_EVENT_ID,
        startsAt: OLDER_EVENT_STARTS_AT,
      }),
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
      }),
    ]);

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: OLDER_CALENDAR_EVENT_ID },
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
    ]);

    const personUpserts = findPersonUpserts(mutationMock);

    expect(personUpserts).toHaveLength(1);
    expect(personUpserts[0][0].createPeople.__args.data).toHaveLength(1);
    expect(personUpserts[0][0].createPeople.__args.data[0]).toMatchObject({
      id: PERSON_ID,
      lastContactAt: PAST_EVENT_STARTS_AT,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
      lastMeetingId: CALENDAR_EVENT_ID,
    });
  });

  it('skips a meeting that has not started yet', async () => {
    const { client, mutationMock } = buildClient([
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: FUTURE_EVENT_STARTS_AT,
      }),
    ]);

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
    ]);

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('skips a canceled meeting', async () => {
    const { client, mutationMock } = buildClient([
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
        isCanceled: true,
      }),
    ]);

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
    ]);

    expect(mutationMock).not.toHaveBeenCalled();
  });

  it('leaves out a person that no longer exists rather than upserting it back', async () => {
    const { client, mutationMock, queryMock } = buildClient([
      buildParticipant({
        calendarEventId: CALENDAR_EVENT_ID,
        startsAt: PAST_EVENT_STARTS_AT,
      }),
    ]);

    queryMock.mockImplementation((query) => {
      if (query.calendarEventParticipants) {
        return Promise.resolve({
          calendarEventParticipants: buildPage([
            buildParticipant({
              calendarEventId: CALENDAR_EVENT_ID,
              startsAt: PAST_EVENT_STARTS_AT,
            }),
          ]),
        });
      }

      return Promise.resolve({ people: buildPage([]) });
    });

    await applyMeetingInteractions(client, [
      { personId: PERSON_ID, calendarEventId: CALENDAR_EVENT_ID },
    ]);

    expect(mutationMock).not.toHaveBeenCalled();
  });
});
