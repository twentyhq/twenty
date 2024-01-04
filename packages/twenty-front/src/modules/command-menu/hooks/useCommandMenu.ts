import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { commandMenuCommands } from '../constants/commandMenuCommands';
import { commandMenuCommandsState } from '../states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command } from '../types/Command';

export const useCommandMenu = () => {
  const navigate = useNavigate();
  const setIsCommandMenuOpened = useSetRecoilState(isCommandMenuOpenedState);
  const setCommands = useSetRecoilState(commandMenuCommandsState);
  const { resetSelectedItem } = useSelectableList('command-menu-list');
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const openCommandMenu = () => {
    setIsCommandMenuOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
  };

  const closeCommandMenu = () => {
    setIsCommandMenuOpened(false);
    resetSelectedItem();
    goBackToPreviousHotkeyScope();
  };

  const toggleCommandMenu = useRecoilCallback(({ snapshot }) => async () => {
    const isCommandMenuOpened = snapshot
      .getLoadable(isCommandMenuOpenedState)
      .getValue();

    if (isCommandMenuOpened) {
      closeCommandMenu();
    } else {
      openCommandMenu();
    }
  });

  const addToCommandMenu = useCallback(
    (addCommand: Command[]) => {
      setCommands((prev) => [...prev, ...addCommand]);
    },
    [setCommands],
  );

  const setToIntitialCommandMenu = () => {
    setCommands(commandMenuCommands);
  };

  const onItemClick = useCallback(
    (onClick?: () => void, to?: string) => {
      toggleCommandMenu();

      if (onClick) {
        onClick();
        return;
      }
      if (to) {
        navigate(to);
        return;
      }
    },
    [navigate, toggleCommandMenu],
  );

  return {
    openCommandMenu,
    closeCommandMenu,
    toggleCommandMenu,
    addToCommandMenu,
    onItemClick,
    setToIntitialCommandMenu,
  };
};
