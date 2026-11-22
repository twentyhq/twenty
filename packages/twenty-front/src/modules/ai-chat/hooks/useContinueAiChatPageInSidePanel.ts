import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type Location } from 'react-router-dom';
import { useIsMobile } from 'twenty-ui/utilities';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { isWorkspaceSetupChatActiveState } from '@/ai-chat/states/isWorkspaceSetupChatActiveState';
import { getAiChatPageSidePanelContinuation } from '@/ai-chat/utils/getAiChatPageSidePanelContinuation';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const useContinueAiChatPageInSidePanel = () => {
  const store = useStore();
  const isMobile = useIsMobile();
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  const continueAiChatPageInSidePanel = useCallback(
    ({
      previousPathname,
      location,
    }: {
      previousPathname: string;
      location: Pick<Location, 'pathname' | 'state'>;
    }) => {
      const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
      const continuation = getAiChatPageSidePanelContinuation({
        previousPathname,
        location,
        isMobile,
        newAiChatThreadId,
        isNewAiChatThreadReplySending: store.get(
          aiChatThreadReplyIsSendingFamilyState.atomFamily({
            threadId: newAiChatThreadId,
          }),
        ),
      });

      if (continuation.type === 'none') {
        return false;
      }

      store.set(isWorkspaceSetupChatActiveState.atom, false);

      if (continuation.type === 'endWorkspaceSetupChat') {
        return false;
      }

      openAskAiPage({
        threadId: continuation.threadId,
        resetNavigationStack: true,
        isContinuedFromFullWidth: true,
      });

      return true;
    },
    [isMobile, openAskAiPage, store],
  );

  return { continueAiChatPageInSidePanel };
};
