import { INBOX_NEW_THREAD_PATH_SEGMENT } from '@/ai/constants/InboxNewThreadPathSegment';
import { getDisplayedInboxThreadId } from '@/ai/utils/getDisplayedInboxThreadId';

const URL_CHAT_ID = '20202020-0000-4000-8000-0000000000aa';
const CURRENT_CHAT_ID = '20202020-0000-4000-8000-0000000000bb';

describe('getDisplayedInboxThreadId', () => {
  it('shows the chat in the URL first', () => {
    expect(
      getDisplayedInboxThreadId({
        urlThreadId: URL_CHAT_ID,
        currentInboxThread: CURRENT_CHAT_ID,
        isOnNewInboxSlot: false,
      }),
    ).toBe(URL_CHAT_ID);
  });

  it('falls back to the current chat', () => {
    expect(
      getDisplayedInboxThreadId({
        urlThreadId: undefined,
        currentInboxThread: CURRENT_CHAT_ID,
        isOnNewInboxSlot: false,
      }),
    ).toBe(CURRENT_CHAT_ID);
  });

  it('shows no record for a new chat', () => {
    expect(
      getDisplayedInboxThreadId({
        urlThreadId: undefined,
        currentInboxThread: CURRENT_CHAT_ID,
        isOnNewInboxSlot: true,
      }),
    ).toBeNull();
  });

  it('shows a draft route before the current chat has switched', () => {
    expect(
      getDisplayedInboxThreadId({
        urlThreadId: INBOX_NEW_THREAD_PATH_SEGMENT,
        currentInboxThread: CURRENT_CHAT_ID,
        isOnNewInboxSlot: false,
      }),
    ).toBeNull();
  });
});
