import { type createStore } from 'jotai';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { inboxRecordRouteObjectNamesSelector } from '@/ai-chat/states/selectors/inboxRecordRouteObjectNamesSelector';
import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';

export const getCurrentAiChatPageThreadId = (
  store: ReturnType<typeof createStore>,
) =>
  getAiChatPageThreadId({
    pathname: window.location.pathname,
    newAiChatThreadId: store.get(newAiChatThreadIdState.atom),
    inboxRecordRouteObjectNames: store.get(
      inboxRecordRouteObjectNamesSelector.atom,
    ),
  });
