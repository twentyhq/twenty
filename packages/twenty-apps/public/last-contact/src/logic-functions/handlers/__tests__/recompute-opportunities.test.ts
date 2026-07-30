import { describe, expect, it } from 'vitest';

import {
  createCoreApiClientMock,
  getFilter,
  toPage,
} from 'src/logic-functions/handlers/__mocks__/create-core-api-client-mock';
import { recomputeOpportunities } from 'src/logic-functions/handlers/recompute-opportunities';

const AT = '2026-02-01T10:00:00.000Z';

describe('recomputeOpportunities', () => {
  it('should mirror the last contact of the point of contact', async () => {
    const { client, mutations } = createCoreApiClientMock({
      opportunities: () =>
        toPage([{ id: 'opportunity-1', pointOfContactId: 'person-1' }]),
      messageParticipants: () => toPage([]),
      calendarEventParticipants: (args) => {
        if (getFilter(args).workspaceMemberId) {
          return toPage([
            {
              calendarEventId: 'event-1',
              isOrganizer: true,
              workspaceMemberId: 'member-1',
            },
          ]);
        }

        return toPage([
          {
            id: 'participant-1',
            personId: 'person-1',
            calendarEvent: { id: 'event-1', startsAt: AT, isCanceled: false },
          },
        ]);
      },
    });

    const updated = await recomputeOpportunities(client, ['opportunity-1']);

    expect(updated).toBe(1);
    expect(mutations).toEqual([
      {
        name: 'updateOpportunity',
        args: {
          id: 'opportunity-1',
          data: {
            lastContactAt: AT,
            lastContactItemMessageId: null,
            lastContactItemCalendarEventId: 'event-1',
          },
        },
      },
    ]);
  });

  it('should clear an opportunity without a point of contact', async () => {
    const { client, mutations } = createCoreApiClientMock({
      opportunities: () =>
        toPage([{ id: 'opportunity-1', pointOfContactId: null }]),
    });

    const updated = await recomputeOpportunities(client, ['opportunity-1']);

    expect(updated).toBe(1);
    expect(mutations[0].args.data).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });

  it('should skip ids that no longer exist', async () => {
    const { client, mutations } = createCoreApiClientMock({
      opportunities: () =>
        toPage([{ id: 'opportunity-1', pointOfContactId: null }]),
    });

    const updated = await recomputeOpportunities(client, [
      'opportunity-1',
      'deleted',
    ]);

    expect(updated).toBe(1);
    expect(mutations).toHaveLength(1);
  });
});
