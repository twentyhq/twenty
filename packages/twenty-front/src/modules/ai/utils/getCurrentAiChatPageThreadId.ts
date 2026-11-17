import { type createStore } from 'jotai';

import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getAiChatPageThreadId } from '@/ai/utils/getAiChatPageThreadId';

export const getCurrentAiChatPageThreadId = (
  store: ReturnType<typeof createStore>,
) =>
  getAiChatPageThreadId({
    pathname: window.location.pathname,
    newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
  });
