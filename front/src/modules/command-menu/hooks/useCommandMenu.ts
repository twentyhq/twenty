import { useRecoilState, useSetRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { commandMenuCommands } from '../constants/commandMenuCommands';
import { commandMenuCommandsState } from '../states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command } from '../types/Command';

export const useCommandMenu = () => {
  const [, setIsCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const setCommands = useSetRecoilState(commandMenuCommandsState);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const openCommandMenu = () => {
    setIsCommandMenuOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
  };

  const closeCommandMenu = () => {
    setIsCommandMenuOpened(false);
    goBackToPreviousHotkeyScope();
  };

  const addToCommandMenu = (addCommand: Command[]) => {
    setCommands((prev) => [...prev, ...addCommand]);
  };

  const setToIntitialCommandMenu = () => {
    setCommands(commandMenuCommands);
  };

  return {
    openCommandMenu,
    closeCommandMenu,
    addToCommandMenu,
    setToIntitialCommandMenu,
  };
};
