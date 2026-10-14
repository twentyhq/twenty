import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleApisViewState } from '@/log-console/states/logConsoleApisViewState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleWebhooksViewState } from '@/log-console/states/logConsoleWebhooksViewState';
import { type LogConsoleApisView } from '@/log-console/types/LogConsoleApisView';
import { type LogConsoleResourceView } from '@/log-console/types/LogConsoleResourceView';
import { type LogConsoleTabId } from '@/log-console/types/LogConsoleTabId';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { isDefined } from 'twenty-shared/utils';

type OpenLogConsoleTabArgs = { isFullScreen?: boolean } & (
  | { tabId: 'apis'; view?: LogConsoleApisView }
  | {
      tabId: Exclude<LogConsoleTabId, 'apis'>;
      view?: LogConsoleResourceView;
    }
);

export const useOpenLogConsoleTab = () => {
  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
  );
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleApisView = useSetAtomState(logConsoleApisViewState);
  const setLogConsoleWebhooksView = useSetAtomState(
    logConsoleWebhooksViewState,
  );

  const openLogConsoleTab = ({
    isFullScreen = false,
    ...tab
  }: OpenLogConsoleTabArgs) => {
    if (tab.tabId === 'apis' && isDefined(tab.view)) {
      setLogConsoleApisView(tab.view);
    }

    if (tab.tabId === 'webhooks' && isDefined(tab.view)) {
      setLogConsoleWebhooksView(tab.view);
    }

    setActiveTabId(tab.tabId);
    setIsLogConsoleFullScreen(isFullScreen);
    setLogConsoleDisplayMode('open');
  };

  return { openLogConsoleTab };
};
