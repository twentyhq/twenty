import { isNull } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useAiChatThreadClick } from '@/ai/hooks/useAiChatThreadClick';
import { useRefreshAgentChatThreads } from '@/ai/hooks/useRefreshAgentChatThreads';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { aiChatPickerOpenErrorComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpenErrorComponentState';
import { aiChatPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerOpeningThreadIdComponentState';
import { aiChatPickerUnavailableThreadIdsComponentState } from '@/side-panel/pages/search-ai-chats/states/aiChatPickerUnavailableThreadIdsComponentState';
import { isAiChatPickerRequestCurrent } from '@/side-panel/pages/search-ai-chats/utils/isAiChatPickerRequestCurrent';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isAiModePath } from '~/utils/isAiModePath';
import { logError } from '~/utils/logError';

export const useOpenAiChatFromPicker = () => {
  const store = useStore();
  const { pathname } = useLocation();
  const { loadAgentChatThread } = useRefreshAgentChatThreads();
  const { handleThreadClick } = useAiChatThreadClick();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setAiChatPickerOpeningThreadId = useSetAtomComponentState(
    aiChatPickerOpeningThreadIdComponentState,
  );
  const setAiChatPickerOpenError = useSetAtomComponentState(
    aiChatPickerOpenErrorComponentState,
  );
  const setAiChatPickerUnavailableThreadIds = useSetAtomComponentState(
    aiChatPickerUnavailableThreadIdsComponentState,
  );

  const openAiChatFromPicker = async (threadId: string) => {
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

    setAiChatPickerOpeningThreadId(threadId);
    setAiChatPickerOpenError(null);

    try {
      const thread = await loadAgentChatThread(threadId);

      if (!isPickerStillOpen()) {
        return;
      }

      if (isNull(thread)) {
        setAiChatPickerUnavailableThreadIds((threadIds) => [
          ...threadIds,
          threadId,
        ]);
        setAiChatPickerOpenError({ threadId, isThreadUnavailable: true });
        return;
      }

      if (!isDefined(thread)) {
        setAiChatPickerOpenError({ threadId, isThreadUnavailable: false });
        return;
      }

      handleThreadClick(thread);

      if (isAiModePath(pathname)) {
        void closeSidePanelMenu();
      }
    } catch (error) {
      logError(error);

      if (isPickerStillOpen()) {
        setAiChatPickerOpenError({ threadId, isThreadUnavailable: false });
      }
    } finally {
      setAiChatPickerOpeningThreadId(null);
    }
  };

  return { openAiChatFromPicker };
};
