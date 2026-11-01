import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSetIsLogConsoleEnabled = () => {
  const setIsLogConsoleEnabled = useSetAtomState(isLogConsoleEnabledState);
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleSelectedLog = useSetAtomState(logConsoleSelectedLogState);
  const setLogConsoleHeight = useSetAtomState(logConsoleHeightState);

  const enableLogConsole = (isEnabled: boolean) => {
    setIsLogConsoleEnabled(isEnabled);
    setLogConsoleSelectedLog(null);
    setIsLogConsoleFullScreen(false);

    if (isEnabled) {
      setLogConsoleHeight(null);
      setLogConsoleDisplayMode('open');
    }
  };

  return { setIsLogConsoleEnabled: enableLogConsole };
};
