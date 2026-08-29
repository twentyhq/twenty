import { beforeEach, describe, expect, it, vi } from 'vitest';

const { queryMock, mutationMock } = vi.hoisted(() => ({
  queryMock: vi.fn(),
  mutationMock: vi.fn(),
}));
vi.mock('twenty-client-sdk/core', () => ({
  CoreApiClient: vi.fn(function () {
    return { query: queryMock, mutation: mutationMock };
  }),
}));

import onOpportunityCreated from '../on-opportunity-created';

const OPPORTUNITY_ID = '11111111-1111-1111-1111-111111111111';
const PERSON_ID = '22222222-2222-2222-2222-222222222222';
const MESSAGE_ID = '33333333-3333-3333-3333-333333333333';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

const handler = onOpportunityCreated.config.handler as (
  event: unknown,
) => Promise<void>;

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({});
});

describe('on-opportunity-created', () => {
  it('should trigger on opportunity creation', () => {
    expect(onOpportunityCreated.success).toBe(true);
    expect(onOpportunityCreated.config.databaseEventTriggerSettings).toEqual({
      eventName: 'opportunity.created',
    });
  });

  it('computes the last contact from the point of contact', async () => {
    queryMock
      .mockResolvedValueOnce({
        opportunity: { id: OPPORTUNITY_ID, pointOfContactId: PERSON_ID },
      })
      .mockResolvedValueOnce({
        person: {
          id: PERSON_ID,
          lastContactAt: OCCURRED_AT,
          lastContactItemMessage: { id: MESSAGE_ID },
          lastContactItemCalendarEvent: null,
        },
      });

    await handler({
      recordId: OPPORTUNITY_ID,
      properties: { after: { id: OPPORTUNITY_ID } },
    });

    expect(mutationMock.mock.calls[0][0].updateOpportunity.__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    });
  });
});
