import { beforeEach, describe, expect, it, vi } from 'vitest';

import { updateRelatedLastContact } from 'src/utils/update-related-last-contact';

const PERSON_ID = '11111111-1111-1111-1111-111111111111';
const MESSAGE_ID = '22222222-2222-2222-2222-222222222222';
const CALENDAR_EVENT_ID = '66666666-6666-6666-6666-666666666666';
const COMPANY_ID = '33333333-3333-3333-3333-333333333333';
const OCCURRED_AT = '2026-06-10T09:00:00.000Z';

type Client = {
  query: ReturnType<typeof vi.fn>;
  mutation: ReturnType<typeof vi.fn>;
};

const buildClient = (): Client => ({
  query: vi.fn(),
  mutation: vi.fn().mockResolvedValue({}),
});

let client: Client;

beforeEach(() => {
  client = buildClient();
});

describe('updateRelatedLastContact', () => {
  it('updates the company and point-of-contact opportunities for an email', async () => {
    client.query.mockResolvedValueOnce({
      person: { id: PERSON_ID, companyId: COMPANY_ID },
    });

    await updateRelatedLastContact(client as never, {
      personId: PERSON_ID,
      occurredAt: OCCURRED_AT,
      itemId: MESSAGE_ID,
      kind: 'email',
    });

    const companyCall = client.mutation.mock.calls.find(
      (call) => call[0].updateCompanies,
    );
    expect(companyCall?.[0].updateCompanies.__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    });
    expect(companyCall?.[0].updateCompanies.__args.filter.and[0]).toEqual({
      id: { eq: COMPANY_ID },
    });

    const opportunityCall = client.mutation.mock.calls.find(
      (call) => call[0].updateOpportunities,
    );
    expect(opportunityCall?.[0].updateOpportunities.__args.filter.and[0]).toEqual(
      { pointOfContactId: { eq: PERSON_ID } },
    );
    expect(opportunityCall?.[0].updateOpportunities.__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: MESSAGE_ID,
      lastContactItemCalendarEventId: null,
    });
  });

  it('sets the calendar event item for a meeting', async () => {
    client.query.mockResolvedValueOnce({
      person: { id: PERSON_ID, companyId: COMPANY_ID },
    });

    await updateRelatedLastContact(client as never, {
      personId: PERSON_ID,
      occurredAt: OCCURRED_AT,
      itemId: CALENDAR_EVENT_ID,
      kind: 'meeting',
    });

    const companyCall = client.mutation.mock.calls.find(
      (call) => call[0].updateCompanies,
    );
    expect(companyCall?.[0].updateCompanies.__args.data).toEqual({
      lastContactAt: OCCURRED_AT,
      lastContactItemMessageId: null,
      lastContactItemCalendarEventId: CALENDAR_EVENT_ID,
    });
  });

  it('only guards against newer contacts', async () => {
    client.query.mockResolvedValueOnce({
      person: { id: PERSON_ID, companyId: COMPANY_ID },
    });

    await updateRelatedLastContact(client as never, {
      personId: PERSON_ID,
      occurredAt: OCCURRED_AT,
      itemId: MESSAGE_ID,
      kind: 'email',
    });

    const expectedGuard = {
      or: [
        { lastContactAt: { is: 'NULL' } },
        { lastContactAt: { lt: OCCURRED_AT } },
      ],
    };
    const companyCall = client.mutation.mock.calls.find(
      (call) => call[0].updateCompanies,
    );
    expect(companyCall?.[0].updateCompanies.__args.filter.and[1]).toEqual(
      expectedGuard,
    );
    const opportunityCall = client.mutation.mock.calls.find(
      (call) => call[0].updateOpportunities,
    );
    expect(opportunityCall?.[0].updateOpportunities.__args.filter.and[1]).toEqual(
      expectedGuard,
    );
  });

  it('skips the company update when the person has no company but still updates opportunities', async () => {
    client.query.mockResolvedValueOnce({
      person: { id: PERSON_ID, companyId: null },
    });

    await updateRelatedLastContact(client as never, {
      personId: PERSON_ID,
      occurredAt: OCCURRED_AT,
      itemId: MESSAGE_ID,
      kind: 'email',
    });

    expect(
      client.mutation.mock.calls.some((call) => call[0].updateCompanies),
    ).toBe(false);
    const opportunityCall = client.mutation.mock.calls.find(
      (call) => call[0].updateOpportunities,
    );
    expect(opportunityCall?.[0].updateOpportunities.__args.filter.and[0]).toEqual(
      { pointOfContactId: { eq: PERSON_ID } },
    );
  });
});
