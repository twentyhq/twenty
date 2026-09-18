import { isAiChatAreaPath } from '~/utils/isAiChatAreaPath';
import { isAiChatInboxPath, isAiChatPath } from '~/utils/isAiChatPath';

const THREAD_ID = '11111111-2222-4333-8444-555555555555';
const CHANNEL_ID = '66666666-7777-4888-8999-aaaaaaaaaaaa';

describe('isAiChatAreaPath', () => {
  it.each([
    ['/chat'],
    [`/chat/${THREAD_ID}`],
    ['/chat/inbox'],
    [`/chat/inbox/${THREAD_ID}`],
    [`/chat/channels/${CHANNEL_ID}`],
    [`/chat/channels/${CHANNEL_ID}/${THREAD_ID}`],
  ])('counts %s as part of the chat area', (pathname) => {
    expect(isAiChatAreaPath(pathname)).toBe(true);
  });

  it.each([['/objects/companies'], ['/settings/profile'], ['/']])(
    'leaves %s outside it',
    (pathname) => {
      expect(isAiChatAreaPath(pathname)).toBe(false);
    },
  );
});

describe('isAiChatPath', () => {
  // '/chat/inbox' fits '/chat/:threadId?' too, so the two have to be told
  // apart or the inbox reads as a thread named "inbox".
  it('does not claim the inbox', () => {
    expect(isAiChatPath('/chat/inbox')).toBe(false);
    expect(isAiChatInboxPath('/chat/inbox')).toBe(true);
  });

  it('still claims the chat page and a thread on it', () => {
    expect(isAiChatPath('/chat')).toBe(true);
    expect(isAiChatPath(`/chat/${THREAD_ID}`)).toBe(true);
  });
});
