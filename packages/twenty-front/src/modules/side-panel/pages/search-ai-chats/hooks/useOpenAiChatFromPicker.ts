import { useStore } from 'jotai';
import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { isAiChatPickerRequestCurrent } from '@/side-panel/pages/search-ai-chats/utils/isAiChatPickerRequestCurrent';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { isAiChatInboxPath } from '~/utils/isAiChatInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';
import { logError } from '~/utils/logError';

export const useOpenAiChatFromPicker = ({
  pendingOpenRequests,
}: {
  pendingOpenRequests: Set<AbortController>;
}) => {
  const store = useStore();
  const { pathname } = useLocation();
  const { loadAgentChatThread } = useRefreshAgentChatThreads();
  const isOnChatPage = isAiChatPath(pathname) || isAiChatInboxPath(pathname);
  const { handleThreadClick } = useAiChatThreadClick({
    shouldOpenInFullPage: isOnChatPage,
  });
  const { closeSidePanelMenu } = useSidePanelMenu();
  const [openingThreadId, setOpeningThreadId] = useState<string | null>(null);
  const [hasOpenError, setHasOpenError] = useState(false);

  const openThread = async (threadId: string) => {
    if (isDefined(openingThreadId)) {
      return;
    }

    const request = new AbortController();

    pendingOpenRequests.add(request);

    const pickerPage = store.get(sidePanelNavigationStackState.atom).at(-1);
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;
    const isPickerStillOpen = () =>
      isAiChatPickerRequestCurrent({
        isRequestAborted: request.signal.aborted,
        isSidePanelOpened: store.get(isSidePanelOpenedState.atom),
        initialPage: pickerPage,
        currentPage: store.get(sidePanelNavigationStackState.atom).at(-1),
        initialWorkspaceId: workspaceId,
        currentWorkspaceId: store.get(currentWorkspaceState.atom)?.id,
      });

    setOpeningThreadId(threadId);
    setHasOpenError(false);

    try {
      const thread = await loadAgentChatThread(threadId);

      if (!isPickerStillOpen()) {
        return;
      }

      if (!isDefined(thread)) {
        setHasOpenError(true);
        return;
      }

      handleThreadClick(thread);

      if (isOnChatPage) {
        void closeSidePanelMenu();
      }
    } catch (error) {
      logError(error);

      if (isPickerStillOpen()) {
        setHasOpenError(true);
      }
    } finally {
      pendingOpenRequests.delete(request);

      if (!request.signal.aborted) {
        setOpeningThreadId(null);
      }
    }
  };

  return { openThread, openingThreadId, hasOpenError };
};
