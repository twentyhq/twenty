import { matchInboxPath } from '@/ai-chat/utils/matchInboxPath';

const THREAD_ID = '6f0ea0a8-0d6f-4b0f-9c54-0d2b8a1f4c11';
const INBOX_RECORD_ROUTE_OBJECT_NAMES = {
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
};

describe('matchInboxPath', () => {
  it.each([
    ['/inbox', { threadId: undefined, isRecordRoute: false }],
    [`/inbox/${THREAD_ID}`, { threadId: THREAD_ID, isRecordRoute: false }],
    ['/objects/agentChatThreads', null],
    [`/object/agentChatThread/${THREAD_ID}`, null],
  ])('matches %s without record route names', (pathname, expectedMatch) => {
    expect(
      matchInboxPath({ pathname, inboxRecordRouteObjectNames: null }),
    ).toEqual(expectedMatch);
  });

  it.each([
    ['/objects/agentChatThreads', { threadId: undefined, isRecordRoute: true }],
    [
      `/object/agentChatThread/${THREAD_ID}`,
      { threadId: THREAD_ID, isRecordRoute: true },
    ],
    [`/inbox/${THREAD_ID}`, { threadId: THREAD_ID, isRecordRoute: false }],
    ['/objects/companies', null],
    [`/object/company/${THREAD_ID}`, null],
  ])('matches %s with record route names', (pathname, expectedMatch) => {
    expect(
      matchInboxPath({
        pathname,
        inboxRecordRouteObjectNames: INBOX_RECORD_ROUTE_OBJECT_NAMES,
      }),
    ).toEqual(expectedMatch);
  });
});
