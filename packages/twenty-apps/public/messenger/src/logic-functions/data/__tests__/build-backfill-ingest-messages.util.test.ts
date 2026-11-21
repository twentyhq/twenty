import { describe, expect, it } from 'vitest';

import { buildBackfillIngestMessages } from 'src/logic-functions/data/build-backfill-ingest-messages.util';
import { findConversationCustomer } from 'src/logic-functions/data/find-conversation-customer.util';
import { type ConversationsApiMessage } from 'src/logic-functions/types/conversations-api.type';

const PAGE = { id: 'page-1', name: 'Acme' };
const CUSTOMER = { id: 'psid-1', name: 'Ada Lovelace' };

const MESSAGES: ConversationsApiMessage[] = [
  {
    id: 'm-2',
    created_time: '2026-11-20T10:05:00+0000',
    from: PAGE,
    to: { data: [CUSTOMER] },
    message: 'Hi Ada',
  },
  {
    id: 'm-1',
    created_time: '2026-11-20T10:00:00+0000',
    from: CUSTOMER,
    to: { data: [PAGE] },
    message: 'Hello',
  },
];

describe('findConversationCustomer', () => {
  it('returns the participant that is not the Page', () => {
    expect(findConversationCustomer({ pageId: PAGE.id, messages: MESSAGES })).toEqual(
      CUSTOMER,
    );
  });

  it('returns nothing for an empty conversation', () => {
    expect(findConversationCustomer({ pageId: PAGE.id, messages: [] })).toBeUndefined();
  });
});

describe('buildBackfillIngestMessages', () => {
  it('marks Page messages outgoing and customer messages incoming, in one thread', () => {
    const ingestMessages = buildBackfillIngestMessages({
      pageId: PAGE.id,
      customerId: CUSTOMER.id,
      customerPersonId: 'person-1',
      messages: MESSAGES,
    });

    expect(
      ingestMessages.map(({ externalId, threadExternalId, participants }) => ({
        externalId,
        threadExternalId,
        from: participants.find(({ role }) => role === 'FROM')?.handle,
      })),
    ).toEqual([
      { externalId: 'm-2', threadExternalId: 'psid-1', from: 'page-1' },
      { externalId: 'm-1', threadExternalId: 'psid-1', from: 'psid-1' },
    ]);
    expect(ingestMessages[1]?.receivedAt).toEqual(new Date('2026-11-20T10:00:00Z'));
    expect(ingestMessages[1]?.participants[0]?.personId).toBe('person-1');
  });
});
