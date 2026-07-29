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

import onOpportunityPointOfContactChanged from '../on-opportunity-point-of-contact-changed';

const OPPORTUNITY_ID = '44444444-4444-4444-4444-444444444444';
const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const EVENT_ID = '55555555-5555-5555-5555-555555555555';
const CONTACTED_AT = '2026-06-10T09:00:00.000Z';

const handler = onOpportunityPointOfContactChanged.config.handler as (
  event: unknown,
) => Promise<void>;

const buildEvent = (pointOfContactId: string | null) => ({
  recordId: OPPORTUNITY_ID,
  properties: {
    updatedFields: ['pointOfContact', 'pointOfContactId'],
    after: { id: OPPORTUNITY_ID, pointOfContactId },
  },
});

const getUpdateArgs = () => mutationMock.mock.calls[0][0].updateOpportunity;

beforeEach(() => {
  queryMock.mockReset();
  mutationMock.mockReset();
  mutationMock.mockResolvedValue({ updateOpportunity: { id: OPPORTUNITY_ID } });
});

describe('on-opportunity-point-of-contact-changed definition', () => {
  it('should be valid and only trigger on pointOfContactId updates', () => {
    expect(onOpportunityPointOfContactChanged.success).toBe(true);
    expect(
      onOpportunityPointOfContactChanged.config.databaseEventTriggerSettings,
    ).toEqual({
      eventName: 'opportunity.updated',
      updatedFields: ['pointOfContactId'],
    });
  });
});

describe('on-opportunity-point-of-contact-changed handler', () => {
  it('should copy the new point of contact last contact onto the opportunity', async () => {
    queryMock.mockResolvedValueOnce({
      person: {
        id: PERSON_ID,
        lastContactAt: CONTACTED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    });

    await handler(buildEvent(PERSON_ID));

    expect(getUpdateArgs().__args).toEqual({
      id: OPPORTUNITY_ID,
      data: {
        lastContactAt: CONTACTED_AT,
        lastContactItemMessageId: MESSAGE_ID,
        lastContactItemCalendarEventId: null,
      },
    });
  });

  it('should keep the meeting item when the new point of contact was last contacted by meeting', async () => {
    queryMock.mockResolvedValueOnce({
      person: {
        id: PERSON_ID,
        lastContactAt: CONTACTED_AT,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: EVENT_ID,
      },
    });

    await handler(buildEvent(PERSON_ID));

    expect(getUpdateArgs().__args.data).toEqual({
      lastContactAt: CONTACTED_AT,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: EVENT_ID,
    });
  });

  it('should clear the opportunity when the new point of contact has no contact history', async () => {
    queryMock.mockResolvedValueOnce({
      person: {
        id: PERSON_ID,
        lastContactAt: null,
        lastContactItemMessageId: null,
        lastContactItemCalendarEventId: null,
      },
    });

    await handler(buildEvent(PERSON_ID));

    expect(getUpdateArgs().__args.data).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });

  it('should clear the opportunity when the point of contact is removed', async () => {
    await handler(buildEvent(null));

    expect(queryMock).not.toHaveBeenCalled();
    expect(getUpdateArgs().__args.data).toEqual({
      lastContactAt: null,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: null,
    });
  });
});
