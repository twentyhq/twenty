import { isNonEmptyString } from '@sniptt/guards';
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { COMMAND_MENU_COMMANDS } from '@/command-menu/constants/CommandMenuCommands';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
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
    ({ snapshot, set }) =>
      () => {
        if (isDefined(mainContextStoreComponentInstanceId)) {
          const contextStoreCurrentObjectMetadataId = snapshot
            .getLoadable(
              contextStoreCurrentObjectMetadataIdComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreCurrentObjectMetadataIdComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreCurrentObjectMetadataId,
          );

          const contextStoreTargetedRecordsRule = snapshot
            .getLoadable(
              contextStoreTargetedRecordsRuleComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreTargetedRecordsRule,
          );

          const contextStoreNumberOfSelectedRecords = snapshot
            .getLoadable(
              contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreNumberOfSelectedRecords,
          );

          const contextStoreFilters = snapshot
            .getLoadable(
              contextStoreFiltersComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreFiltersComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreFilters,
          );

          const contextStoreCurrentViewId = snapshot
            .getLoadable(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreCurrentViewId,
          );
        }

        setIsCommandMenuOpened(true);
        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
      },
    [
      mainContextStoreComponentInstanceId,
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
