import { isDefined } from 'twenty-shared/utils';

import { LOG_CONSOLE_TAB_LIST_INSTANCE_ID } from '@/log-console/constants/LogConsoleTabListInstanceId';
import { useSetIsLogConsoleEnabled } from '@/log-console/hooks/useSetIsLogConsoleEnabled';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleActiveSourceIdState } from '@/log-console/states/logConsoleActiveSourceIdState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleFiltersState } from '@/log-console/states/logConsoleFiltersState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { type LogConsoleView } from '@/log-console/types/LogConsoleView';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useOpenLogConsole = () => {
  const isLogConsoleEnabled = useAtomStateValue(isLogConsoleEnabledState);
  const { setIsLogConsoleEnabled } = useSetIsLogConsoleEnabled();
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleActiveSourceId = useSetAtomState(
    logConsoleActiveSourceIdState,
  );
  const setActiveTabId = useSetAtomComponentState(
    activeTabIdComponentState,
    LOG_CONSOLE_TAB_LIST_INSTANCE_ID,
  );
  const setLogConsoleFilters = useSetAtomState(logConsoleFiltersState);
  const setLogConsoleSelectedLog = useSetAtomState(logConsoleSelectedLogState);

  const openLogConsole = (view?: LogConsoleView) => {
    if (isDefined(view)) {
      setLogConsoleActiveSourceId(view.sourceId);
      setActiveTabId(view.sourceId);
      setLogConsoleFilters(view.filters);
      setLogConsoleSelectedLog(null);
    }

    if (!isLogConsoleEnabled) {
      setIsLogConsoleEnabled(true);
      return;
    }

    setIsLogConsoleFullScreen(false);
    setLogConsoleDisplayMode('open');
  };

  return { openLogConsole };
};
