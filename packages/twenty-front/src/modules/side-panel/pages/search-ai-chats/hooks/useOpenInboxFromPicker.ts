import { isNull } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

import { useInboxThreadClick } from '@/ai/hooks/useInboxThreadClick';
import { useLoadInboxThread } from '@/ai/hooks/useLoadInboxThread';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { inboxPickerOpenErrorComponentState } from '@/side-panel/pages/search-ai-chats/states/inboxPickerOpenErrorComponentState';
import { inboxPickerOpeningThreadIdComponentState } from '@/side-panel/pages/search-ai-chats/states/inboxPickerOpeningThreadIdComponentState';
import { inboxPickerUnavailableThreadIdsComponentState } from '@/side-panel/pages/search-ai-chats/states/inboxPickerUnavailableThreadIdsComponentState';
import { isInboxPickerRequestCurrent } from '@/side-panel/pages/search-ai-chats/utils/isInboxPickerRequestCurrent';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { isAiModePath } from '~/utils/isAiModePath';
import { logError } from '~/utils/logError';

export const useOpenInboxFromPicker = () => {
  const store = useStore();
  const { pathname } = useLocation();
  const { loadInboxThread } = useLoadInboxThread();
  const { handleThreadClick } = useInboxThreadClick();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setInboxPickerOpeningThreadId = useSetAtomComponentState(
    inboxPickerOpeningThreadIdComponentState,
  );
  const setInboxPickerOpenError = useSetAtomComponentState(
    inboxPickerOpenErrorComponentState,
  );
  const setInboxPickerUnavailableThreadIds = useSetAtomComponentState(
    inboxPickerUnavailableThreadIdsComponentState,
  );

  const openInboxFromPicker = async (threadId: string) => {
    const pickerPage = store.get(sidePanelNavigationStackState.atom).at(-1);
    const workspaceId = store.get(currentWorkspaceState.atom)?.id;
    const isPickerStillOpen = () =>
      isInboxPickerRequestCurrent({
        isSidePanelOpened: store.get(isSidePanelOpenedState.atom),
        initialPage: pickerPage,
        currentPage: store.get(sidePanelNavigationStackState.atom).at(-1),
        initialWorkspaceId: workspaceId,
        currentWorkspaceId: store.get(currentWorkspaceState.atom)?.id,
      });

    setInboxPickerOpeningThreadId(threadId);
    setInboxPickerOpenError(null);

    try {
      const thread = await loadInboxThread(threadId);

      if (!isPickerStillOpen()) {
        return;
      }

      if (isNull(thread)) {
        setInboxPickerUnavailableThreadIds((threadIds) => [
          ...threadIds,
          threadId,
        ]);
        setInboxPickerOpenError({ threadId, isThreadUnavailable: true });
        return;
      }

      if (!isDefined(thread)) {
        setInboxPickerOpenError({ threadId, isThreadUnavailable: false });
        return;
      }

      handleThreadClick(thread);

      if (isAiModePath(pathname)) {
        void closeSidePanelMenu();
      }
    } catch (error) {
      logError(error);

      if (isPickerStillOpen()) {
        setInboxPickerOpenError({ threadId, isThreadUnavailable: false });
      }
    } finally {
      setInboxPickerOpeningThreadId(null);
    }
  };

  return { openInboxFromPicker };
};
