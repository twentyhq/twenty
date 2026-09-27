import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { logConsoleSelectedLogState } from '@/log-console/states/logConsoleSelectedLogState';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const useSetAdvancedMode = () => {
  const setIsAdvancedModeEnabled = useSetAtomState(isAdvancedModeEnabledState);
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const setIsLogConsoleFullScreen = useSetAtomState(
    isLogConsoleFullScreenState,
  );
  const setLogConsoleSelectedLog = useSetAtomState(logConsoleSelectedLogState);
  const setLogConsoleHeight = useSetAtomState(logConsoleHeightState);

  const setAdvancedMode = (isEnabled: boolean) => {
    setIsAdvancedModeEnabled(isEnabled);

    if (isEnabled) {
      setLogConsoleSelectedLog(null);
      setIsLogConsoleFullScreen(false);
      setLogConsoleHeight(null);
      setLogConsoleDisplayMode('open');
    }
  };

  return { setAdvancedMode };
};
