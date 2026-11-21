import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type Location } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { shouldOpenAiChatAfterOnboardingState } from '@/ai-chat/states/shouldOpenAiChatAfterOnboardingState';
import { getAiChatPageThreadId } from '@/ai-chat/utils/getAiChatPageThreadId';
import { isAiChatHandoffSkipped } from '@/ai-chat/utils/isAiChatHandoffSkipped';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { isInboxPath } from '~/utils/isInboxPath';
import { isSettingsPath } from '~/utils/isSettingsPath';

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
      location: Location;
    }) => {
      const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
      const threadId = getAiChatPageThreadId({
        pathname: previousPathname,
        newAiChatThreadId,
      });

      if (
        !isDefined(threadId) ||
        isMobile ||
        isAiChatPath(location.pathname) ||
        isInboxPath(location.pathname) ||
        isAiChatHandoffSkipped(location.state)
      ) {
        return false;
      }

      store.set(shouldOpenAiChatAfterOnboardingState.atom, false);

      if (isSettingsPath(location.pathname)) {
        return false;
      }

      const isIdleNewChat =
        threadId === newAiChatThreadId &&
        !store.get(
          aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
        );

      openAskAiPage({
        threadId: isIdleNewChat ? undefined : threadId,
        resetNavigationStack: true,
        isContinuedFromFullWidth: true,
      });

      return true;
    },
    [isMobile, openAskAiPage, store],
  );

  return { continueAiChatPageInSidePanel };
};
