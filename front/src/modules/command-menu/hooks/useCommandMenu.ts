import { useRecoilState, useSetRecoilState } from 'recoil';

import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { commandMenuCommands } from '../constants/commandMenuCommands';
import { commandMenuCommand } from '../states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command } from '../types/Command';

export function useCommandMenu() {
  const [, setIsCommandMenuOpenedState] = useRecoilState(
    isCommandMenuOpenedState,
  );
  const setCommands = useSetRecoilState(commandMenuCommand);
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  function openCommandMenu() {
    setIsCommandMenuOpenedState(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenu);
  }

  function closeCommandMenu() {
    setIsCommandMenuOpenedState(false);
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
