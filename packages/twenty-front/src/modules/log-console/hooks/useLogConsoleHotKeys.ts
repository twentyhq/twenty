import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { PageFocusId } from '@/types/PageFocusId';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

export const useLogConsoleHotKeys = ({
  isLogConsoleAllowed,
}: {
  isLogConsoleAllowed: boolean;
}) => {
  const [logConsoleDisplayMode, setLogConsoleDisplayMode] = useAtomState(
    logConsoleDisplayModeState,
  );

  const restoreClosedLogConsole = () => {
    if (isLogConsoleAllowed && logConsoleDisplayMode === 'closed') {
      setLogConsoleDisplayMode('collapsed');
    }
  };

  useGlobalHotkeys({
    keys: ['ctrl+`'],
    callback: restoreClosedLogConsole,
    containsModifier: true,
    dependencies: [restoreClosedLogConsole],
  });

  useHotkeysOnFocusedElement({
    keys: ['ctrl+`'],
    callback: restoreClosedLogConsole,
    focusId: PageFocusId.Settings,
    dependencies: [restoreClosedLogConsole],
  });
};
