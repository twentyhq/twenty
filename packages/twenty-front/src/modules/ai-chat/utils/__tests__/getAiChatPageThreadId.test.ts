import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';

const THREAD_ID = '6f0ea0a8-0d6f-4b0f-9c54-0d2b8a1f4c11';
const NEW_AI_CHAT_THREAD_ID = '3a4b5c6d-7e8f-4a1b-9c2d-3e4f5a6b7c8d';
const INBOX_RECORD_ROUTE_OBJECT_NAMES = {
  nameSingular: 'agentChatThread',
  namePlural: 'agentChatThreads',
};

describe('getAiChatPageThreadId', () => {
  it.each([
    [`/chat/${THREAD_ID}`, THREAD_ID],
    [`/inbox/${THREAD_ID}`, THREAD_ID],
    ['/chat', NEW_AI_CHAT_THREAD_ID],
    ['/chat/new', NEW_AI_CHAT_THREAD_ID],
    ['/inbox/new', NEW_AI_CHAT_THREAD_ID],
    ['/inbox', null],
    ['/objects/companies', null],
    [`/object/agentChatThread/${THREAD_ID}`, null],
  ])('reads %s as %s', (pathname, expectedThreadId) => {
    expect(
      getAiChatPageThreadId({
        pathname,
        newAiChatThreadId: NEW_AI_CHAT_THREAD_ID,
        inboxRecordRouteObjectNames: null,
      }),
    ).toBe(expectedThreadId);
  });

  it.each([
    [`/object/agentChatThread/${THREAD_ID}`, THREAD_ID],
    ['/object/agentChatThread/new', NEW_AI_CHAT_THREAD_ID],
    ['/objects/agentChatThreads', null],
    [`/object/company/${THREAD_ID}`, null],
  ])(
    'reads %s as %s when the inbox is on the thread record routes',
    (pathname, expectedThreadId) => {
      expect(
        getAiChatPageThreadId({
          pathname,
          newAiChatThreadId: NEW_AI_CHAT_THREAD_ID,
          inboxRecordRouteObjectNames: INBOX_RECORD_ROUTE_OBJECT_NAMES,
        }),
      ).toBe(expectedThreadId);
    },
  );
});
