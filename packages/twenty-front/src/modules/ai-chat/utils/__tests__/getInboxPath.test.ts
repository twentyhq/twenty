import { getInboxPath } from '@/ai-chat/utils/getInboxPath';

const THREAD_ID = '6f0ea0a8-0d6f-4b0f-9c54-0d2b8a1f4c11';
const INBOX_RECORD_ROUTE_OBJECT_NAMES = {
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
};

describe('getInboxPath', () => {
  it('builds the inbox route without record route names', () => {
    expect(
      getInboxPath({ threadId: THREAD_ID, inboxRecordRouteObjectNames: null }),
    ).toBe(`/inbox/${THREAD_ID}`);
  });

  it('builds the thread record route with the view', () => {
    expect(
      getInboxPath({
        threadId: THREAD_ID,
        inboxRecordRouteObjectNames: INBOX_RECORD_ROUTE_OBJECT_NAMES,
        queryParams: { viewId: 'view-id' },
      }),
    ).toBe(`/object/agentChatThread/${THREAD_ID}?viewId=view-id`);
  });

  it('builds the thread record index route when no thread is open', () => {
    expect(
      getInboxPath({
        threadId: null,
        inboxRecordRouteObjectNames: INBOX_RECORD_ROUTE_OBJECT_NAMES,
      }),
    ).toBe('/objects/agentChatThreads');
  });
});
