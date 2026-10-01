import { getDisplayedAiChatThreadId } from '@/ai/utils/getDisplayedAiChatThreadId';

const URL_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const CURRENT_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';

describe('getDisplayedAiChatThreadId', () => {
  it('shows the chat in the URL first', () => {
    expect(
      getDisplayedAiChatThreadId({
        urlThreadId: URL_CHAT_ID,
        currentAiChatThread: CURRENT_CHAT_ID,
      }),
    ).toBe(URL_CHAT_ID);
  });

  it('falls back to the current chat', () => {
    expect(
      getDisplayedAiChatThreadId({
        urlThreadId: undefined,
        currentAiChatThread: CURRENT_CHAT_ID,
      }),
    ).toBe(CURRENT_CHAT_ID);
  });

  it('shows no record for a new chat', () => {
    expect(
      getDisplayedAiChatThreadId({
        urlThreadId: 'new',
        currentAiChatThread: 'new-thread-draft',
      }),
    ).toBeNull();
  });
});
