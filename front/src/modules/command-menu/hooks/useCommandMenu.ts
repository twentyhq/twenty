import { useRecoilState, useSetRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { commandMenuCommands } from '../constants/commandMenuCommands';
import { commandMenuCommandsState } from '../states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command } from '../types/Command';

export function useCommandMenu() {
  const [, setIsCommandMenuOpened] = useRecoilState(isCommandMenuOpenedState);
  const setCommands = useSetRecoilState(commandMenuCommandsState);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function openCommandMenu() {
    setIsCommandMenuOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
  }

  function closeCommandMenu() {
    setIsCommandMenuOpened(false);
    goBackToPreviousHotkeyScope();
  }

  function addToCommandMenu(addCommand: Command[]) {
    setCommands((prev) => [...prev, ...addCommand]);
  }

  function setToIntitialCommandMenu() {
    setCommands(commandMenuCommands);
  }

  return {
    openCommandMenu,
    closeCommandMenu,
    addToCommandMenu,
    setToIntitialCommandMenu,
  };
}
