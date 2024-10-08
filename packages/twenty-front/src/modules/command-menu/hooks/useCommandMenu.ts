import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useSetRecoilState } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { ALL_ICONS } from '@ui/display/icon/providers/internal/AllIcons';
import { sortByProperty } from '~/utils/array/sortByProperty';
import { commandMenuCommandsState } from '../states/commandMenuCommandsState';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';
import { Command, CommandType } from '../types/Command';

export const useCommandMenu = () => {
  const navigate = useNavigate();
  const setIsCommandMenuOpened = useSetRecoilState(isCommandMenuOpenedState);
  const setCommands = useSetRecoilState(commandMenuCommandsState);
  const { resetSelectedItem } = useSelectableList('command-menu-list');
  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const openCommandMenu = useCallback(() => {
    setIsCommandMenuOpened(true);
    setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
  }, [setHotkeyScopeAndMemorizePreviousScope, setIsCommandMenuOpened]);

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
    [closeCommandMenu, openCommandMenu],
  );

  const addToCommandMenu = useCallback(
    (addCommand: Command[]) => {
      setCommands((prev) => [...prev, ...addCommand]);
    },
    [setCommands],
  );

  const setObjectsInCommandMenu = (menuItems: ObjectMetadataItem[]) => {
    const formattedItems = [
      ...[
        ...menuItems.map(
          (item) =>
            ({
              id: item.id,
              to: `/objects/${item.namePlural}`,
              label: `Go to ${item.labelPlural}`,
              type: CommandType.Navigate,
              firstHotKey: 'G',
              secondHotKey: item.labelPlural[0],
              Icon: ALL_ICONS[
                (item?.icon as keyof typeof ALL_ICONS) ?? 'IconArrowUpRight'
              ],
            }) as Command,
        ),
      ].sort(sortByProperty('label', 'asc')),
      COMMAND_MENU_COMMANDS.settings,
    ];
    setCommands(formattedItems);
  };

  const onItemClick = useCallback(
    (onClick?: () => void, to?: string) => {
      toggleCommandMenu();

      if (isDefined(onClick)) {
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
    setObjectsInCommandMenu,
  };
};
