import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { isNonEmptyString } from '@sniptt/guards';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isNonNullable } from '~/utils/isNonNullable';

import { COMMAND_MENU_COMMANDS } from '../constants/CommandMenuCommands';
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

  const closeCommandMenu = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          setIsCommandMenuOpened(false);
          resetSelectedItem();
          goBackToPreviousHotkeyScope();
        }
      },
    [goBackToPreviousHotkeyScope, resetSelectedItem, setIsCommandMenuOpened],
  );

  const toggleCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        set(commandMenuSearchState, '');

        if (isCommandMenuOpened) {
          closeCommandMenu();
        } else {
          openCommandMenu();
        }
      },
  );

  const addToCommandMenu = useCallback(
    (addCommand: Command[]) => {
      setCommands((prev) => [...prev, ...addCommand]);
    },
    [setCommands],
  );

  const setToInitialCommandMenu = () => {
    setCommands(COMMAND_MENU_COMMANDS);
  };

  const onItemClick = useCallback(
    (onClick?: () => void, to?: string) => {
      toggleCommandMenu();

      if (isNonNullable(onClick)) {
        onClick();
        return;
      }
      if (isNonEmptyString(to)) {
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
    setToInitialCommandMenu,
  };
};
