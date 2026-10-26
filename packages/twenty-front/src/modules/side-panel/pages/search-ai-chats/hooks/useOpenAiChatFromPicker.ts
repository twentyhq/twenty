import { isNull } from '@sniptt/guards';
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
import { isAiModePath } from '~/utils/isAiModePath';
import { logError } from '~/utils/logError';

type AiChatPickerOpenError = {
  threadId: string;
  isThreadUnavailable: boolean;
};

export const useOpenAiChatFromPicker = () => {
  const store = useStore();
  const { pathname } = useLocation();
  const { loadAgentChatThread } = useRefreshAgentChatThreads();
  const { handleThreadClick } = useAiChatThreadClick();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const [openingThreadId, setOpeningThreadId] = useState<string | null>(null);
  const [openError, setOpenError] = useState<AiChatPickerOpenError | null>(
    null,
  );
  const [unavailableThreadIds, setUnavailableThreadIds] = useState<string[]>(
    [],
  );

  const openThread = async (threadId: string) => {
    const pickerPage = store.get(sidePanelNavigationStackState.atom).at(-1);
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;
    const isPickerStillOpen = () =>
      isAiChatPickerRequestCurrent({
        isSidePanelOpened: store.get(isSidePanelOpenedState.atom),
        initialPage: pickerPage,
        currentPage: store.get(sidePanelNavigationStackState.atom).at(-1),
        initialWorkspaceId: workspaceId,
        currentWorkspaceId: store.get(currentWorkspaceState.atom)?.id,
      });

    setOpeningThreadId(threadId);
    setOpenError(null);

    try {
      const thread = await loadAgentChatThread(threadId);

      if (!isPickerStillOpen()) {
        return;
      }

      if (isNull(thread)) {
        setUnavailableThreadIds((threadIds) => [...threadIds, threadId]);
        setOpenError({ threadId, isThreadUnavailable: true });
        return;
      }

      if (!isDefined(thread)) {
        setOpenError({ threadId, isThreadUnavailable: false });
        return;
      }

      handleThreadClick(thread);

      if (isAiModePath(pathname)) {
        void closeSidePanelMenu();
      }
    } catch (error) {
      logError(error);

      if (isPickerStillOpen()) {
        setOpenError({ threadId, isThreadUnavailable: false });
      }
    } finally {
      setOpeningThreadId(null);
    }
  };

  return { openThread, openingThreadId, openError, unavailableThreadIds };
};
