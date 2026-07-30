import { describe, expect, it } from 'vitest';

import {
  createCoreApiClientMock,
  getFilter,
  getInValues,
  toPage,
} from 'src/logic-functions/handlers/__mocks__/create-core-api-client-mock';
import { recomputePeople } from 'src/logic-functions/handlers/recompute-people';

const OLDER = '2026-01-01T10:00:00.000Z';
const NEWER = '2026-02-01T10:00:00.000Z';

describe('recomputePeople', () => {
  it('should write the newest email and meeting of each person', async () => {
    const { client, mutations } = createCoreApiClientMock({
      people: (args) =>
        toPage(getInValues(getFilter(args), 'id').map((id) => ({ id }))),
      messageParticipants: (args) => {
        const filter = getFilter(args);

        if (filter.workspaceMemberId) {
          return toPage([
            {
              messageId: 'message-1',
              role: 'FROM',
              workspaceMemberId: 'member-1',
            },
          ]);
        }

        return toPage([
          {
            id: 'participant-1',
            personId: 'person-1',
            message: { id: 'message-1', receivedAt: OLDER },
          },
        ]);
      },
      calendarEventParticipants: (args) => {
        const filter = getFilter(args);

        if (filter.workspaceMemberId) {
          return toPage([
            {
              calendarEventId: 'event-1',
              isOrganizer: true,
              workspaceMemberId: 'member-2',
            },
          ]);
        }

        return toPage([
          {
            id: 'participant-2',
            personId: 'person-1',
            calendarEvent: {
              id: 'event-1',
              startsAt: NEWER,
              isCanceled: false,
            },
          },
        ]);
      },
    });

    const updated = await recomputePeople(client, ['person-1']);

    expect(updated).toBe(1);
    expect(mutations).toEqual([
      {
        name: 'updatePerson',
        args: {
          id: 'person-1',
          data: {
            lastContactAt: NEWER,
            lastContactById: 'member-2',
            lastOutboundAt: NEWER,
            lastInboundAt: NEWER,
            lastEmailId: 'message-1',
            lastMeetingId: 'event-1',
            lastContactItemCalendarEventId: 'event-1',
            lastContactItemMessageId: null,
          },
        },
      },
    ]);
  });

  it('should clear the fields of a person with no interaction left', async () => {
    const { client, mutations } = createCoreApiClientMock({
      people: (args) =>
        toPage(getInValues(getFilter(args), 'id').map((id) => ({ id }))),
      messageParticipants: () => toPage([]),
      calendarEventParticipants: () => toPage([]),
    });

    const updated = await recomputePeople(client, ['person-1']);

    expect(updated).toBe(1);
    expect(mutations[0].args.data).toEqual({
      lastContactAt: null,
      lastContactById: null,
      lastOutboundAt: null,
      lastInboundAt: null,
      lastEmailId: null,
      lastMeetingId: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });

  it('should skip ids that no longer exist', async () => {
    const { client, mutations } = createCoreApiClientMock({
      people: () => toPage([{ id: 'person-1' }]),
      messageParticipants: () => toPage([]),
      calendarEventParticipants: () => toPage([]),
    });

    const updated = await recomputePeople(client, ['person-1', 'deleted']);

    expect(updated).toBe(1);
    expect(mutations.map((mutation) => mutation.args.id)).toEqual(['person-1']);
  });

  it('should not query anything when the selection is empty', async () => {
    const { client, mutations } = createCoreApiClientMock({});

    const updated = await recomputePeople(client, []);

    expect(updated).toBe(0);
    expect(mutations).toEqual([]);
  });

  it('should ignore canceled and future calendar events', async () => {
    const future = new Date(Date.now() + 86_400_000).toISOString();

    const { client, mutations } = createCoreApiClientMock({
      people: () => toPage([{ id: 'person-1' }]),
      messageParticipants: () => toPage([]),
      calendarEventParticipants: (args) => {
        if (getFilter(args).workspaceMemberId) {
          return toPage([]);
        }

        return toPage([
          {
            id: 'participant-1',
            personId: 'person-1',
            calendarEvent: {
              id: 'canceled-event',
              startsAt: OLDER,
              isCanceled: true,
            },
          },
          {
            id: 'participant-2',
            personId: 'person-1',
            calendarEvent: {
              id: 'future-event',
              startsAt: future,
              isCanceled: false,
            },
          },
        ]);
      },
    });

    await recomputePeople(client, ['person-1']);

    expect(mutations[0].args.data).toMatchObject({
      lastContactAt: null,
      lastMeetingId: null,
    });
  });
});
