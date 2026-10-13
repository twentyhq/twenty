import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleApiKeysViewState } from '@/log-console/states/logConsoleApiKeysViewState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';
import { type LogConsoleTabId } from '@/log-console/types/LogConsoleTabId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

export const useOpenLogConsoleTab = () => {
  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
  );
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleApiKeysView = useSetAtomState(logConsoleApiKeysViewState);
  const setLogConsoleWebhooksView = useSetAtomState(
    logConsoleWebhooksViewState,
  );

  const openLogConsoleTab = ({
    tabId,
    view,
  }: {
    tabId: LogConsoleTabId;
    view?: LogConsoleResourceView;
  }) => {
    if (isDefined(view) && tabId === 'apis') {
      setLogConsoleApiKeysView(view);
    }

    if (isDefined(view) && tabId === 'webhooks') {
      setLogConsoleWebhooksView(view);
    }

    setActiveTabId(tabId);
    setIsLogConsoleFullScreen(false);
    setLogConsoleDisplayMode('open');
  };

  return { openLogConsoleTab };
};
