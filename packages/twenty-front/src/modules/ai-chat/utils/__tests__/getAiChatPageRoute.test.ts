import { AppPath } from 'twenty-shared/types';

import { getAiChatPageRoute } from '@/ai-chat/utils/getAiChatPageRoute';

const THREAD_ID = '20202020-0000-4000-8000-0000000000aa';

describe('getAiChatPageRoute', () => {
  it.each([
    [true, THREAD_ID, AppPath.AiChatInbox, THREAD_ID],
    [true, null, AppPath.AiChatInbox, 'new'],
    [false, THREAD_ID, AppPath.AiChat, THREAD_ID],
    [false, null, AppPath.AiChat, null],
  ])(
    'routes isInbox=%s and thread %s to %s with %s',
    (isInbox, threadId, expectedAppPath, expectedThreadId) => {
      expect(getAiChatPageRoute({ isInbox, threadId })).toEqual({
        appPath: expectedAppPath,
        threadId: expectedThreadId,
      });
    },
  );
});
