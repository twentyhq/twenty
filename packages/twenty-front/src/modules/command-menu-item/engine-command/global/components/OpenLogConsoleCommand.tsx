import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const OpenLogConsoleCommand = () => {
  const setLogConsoleDisplayMode = useSetAtomState(logConsoleDisplayModeState);
  const { closeSidePanelMenu } = useSidePanelMenu();

  const openLogConsole = () => {
    setLogConsoleDisplayMode('open');
    closeSidePanelMenu();
  };

  return <HeadlessEngineCommandWrapperEffect execute={openLogConsole} />;
};
