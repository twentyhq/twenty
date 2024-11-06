import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { actionMenuEntriesComponentSelector } from '@/action-menu/states/actionMenuEntriesComponentSelector';
import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
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

  const mainContextStoreComponentInstanceId = useRecoilValue(
    mainContextStoreComponentInstanceIdState,
  );

  const openCommandMenu = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        if (isDefined(mainContextStoreComponentInstanceId)) {
          const actionMenuEntries = snapshot.getLoadable(
            actionMenuEntriesComponentSelector.selectorFamily({
              instanceId: mainContextStoreComponentInstanceId,
            }),
          );

          const commands = Object.values(COMMAND_MENU_COMMANDS);

          const actionCommands = actionMenuEntries
            .getValue()
            ?.filter((actionMenuEntry) => actionMenuEntry.type === 'standard')
            ?.map((actionMenuEntry) => ({
              id: actionMenuEntry.key,
              label: actionMenuEntry.label,
              Icon: actionMenuEntry.Icon,
              onCommandClick: actionMenuEntry.onClick,
              type: CommandType.StandardAction,
            }));

          const workflowRunCommands = actionMenuEntries
            .getValue()
            ?.filter(
              (actionMenuEntry) => actionMenuEntry.type === 'workflow-run',
            )
            ?.map((actionMenuEntry) => ({
              id: actionMenuEntry.key,
              label: actionMenuEntry.label,
              Icon: actionMenuEntry.Icon,
              onCommandClick: actionMenuEntry.onClick,
              type: CommandType.WorkflowRun,
            }));

          setCommands([...commands, ...actionCommands, ...workflowRunCommands]);
        }

        setIsCommandMenuOpened(true);
        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
      },
    [
      mainContextStoreComponentInstanceId,
      setCommands,
      setHotkeyScopeAndMemorizePreviousScope,
      setIsCommandMenuOpened,
    ],
  );

  const closeCommandMenu = useRecoilCallback(
    ({ snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          setIsCommandMenuOpened(false);
          setCommands([]);
          resetSelectedItem();
          goBackToPreviousHotkeyScope();
        }
      },
    [
      goBackToPreviousHotkeyScope,
      resetSelectedItem,
      setCommands,
      setIsCommandMenuOpened,
    ],
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
              firstHotKey: item.shortcut ? 'G' : undefined,
              secondHotKey: item.shortcut,
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
