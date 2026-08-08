import { useStore } from 'jotai';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { useSwitchAgentChatThreadWithDraft } from '@/ai/hooks/useSwitchAgentChatThreadWithDraft';
import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { aiChatPageLastHandledThreadIdParamState } from '@/ai/states/aiChatPageLastHandledThreadIdParamState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const AiChatPageThreadUrlSyncEffect = () => {
  const { threadId } = useParams();
  const threadIdParam = threadId ?? null;
  const currentAiChatThread = useAtomStateValue(currentAiChatThreadState);
  const { switchThreadWithDraft } = useSwitchAgentChatThreadWithDraft();
  const navigateApp = useNavigateApp();
  const store = useStore();

  // On unmount, forget the handled param so the URL wins again on the next
  // visit of the chat page, exactly as it does on a first mount.
  useEffect(() => {
    return () => {
      store.set(aiChatPageLastHandledThreadIdParamState.atom, null);
    };
  }, [store]);

  useEffect(() => {
    const hasThreadIdParamChanged =
      store.get(aiChatPageLastHandledThreadIdParamState.atom) !== threadIdParam;
    store.set(aiChatPageLastHandledThreadIdParamState.atom, threadIdParam);

    // The URL wins when its param changed to a valid thread id: deep link,
    // initial mount and browser back/forward. A malformed param falls
    // through so the thread state normalizes the URL instead.
    if (
      hasThreadIdParamChanged &&
      isDefined(threadIdParam) &&
      isValidUuid(threadIdParam)
    ) {
      if (threadIdParam !== currentAiChatThread) {
        switchThreadWithDraft(threadIdParam);
      }
      return;
    }

    // Otherwise the thread state drives the URL, without history entries.
    if (
      isDefined(currentAiChatThread) &&
      isValidUuid(currentAiChatThread) &&
      currentAiChatThread !== threadIdParam
    ) {
      navigateApp(
        AppPath.AiChat,
        { threadId: currentAiChatThread },
        undefined,
        { replace: true },
      );
      return;
    }

    if (
      currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY &&
      isDefined(threadIdParam)
    ) {
      navigateApp(AppPath.AiChat, { threadId: null }, undefined, {
        replace: true,
      });
    }
  }, [
    threadIdParam,
    currentAiChatThread,
    switchThreadWithDraft,
    navigateApp,
    store,
  ]);

  return null;
};
