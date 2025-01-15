import { useRecoilCallback, useRecoilValue } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';
import { isDefined } from '~/utils/isDefined';

import { actionMenuEntriesComponentState } from '@/action-menu/states/actionMenuEntriesComponentState';
import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { contextStoreCurrentObjectMetadataIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreFiltersComponentState } from '@/context-store/states/contextStoreFiltersComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { mainContextStoreComponentInstanceIdState } from '@/context-store/states/mainContextStoreComponentInstanceId';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { viewableRecordNameSingularState } from '@/object-record/record-right-drawer/states/viewableRecordNameSingularState';
import { emitRightDrawerCloseEvent } from '@/ui/layout/right-drawer/utils/emitRightDrawerCloseEvent';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
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

          const contextStoreCurrentViewType = snapshot
            .getLoadable(
              contextStoreCurrentViewTypeComponentState.atomFamily({
                instanceId: mainContextStoreComponentInstanceId,
              }),
            )
            .getValue();

          set(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            contextStoreCurrentViewType,
          );
        }

        const actionMenuEntries = snapshot
          .getLoadable(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: mainContextStoreComponentInstanceId,
            }),
          )
          .getValue();

        set(
          actionMenuEntriesComponentState.atomFamily({
            instanceId: 'command-menu',
          }),
          actionMenuEntries,
        );

        set(isCommandMenuOpenedState, true);
        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
      },
    [
      mainContextStoreComponentInstanceId,
      setHotkeyScopeAndMemorizePreviousScope,
    ],
  );

  const closeCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          set(
            contextStoreCurrentObjectMetadataIdComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            null,
          );

          set(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            {
              mode: 'selection',
              selectedRecordIds: [],
            },
          );

          set(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            0,
          );

          set(
            contextStoreFiltersComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            [],
          );

          set(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            null,
          );

          set(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            null,
          );

          set(
            actionMenuEntriesComponentState.atomFamily({
              instanceId: 'command-menu',
            }),
            new Map(),
          );

          set(viewableRecordIdState, null);
          set(commandMenuPageState, CommandMenuPages.Root);
          set(isCommandMenuOpenedState, false);
          resetSelectedItem();
          goBackToPreviousHotkeyScope();

          emitRightDrawerCloseEvent();
        }
      },
    [goBackToPreviousHotkeyScope, resetSelectedItem],
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

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set }) => {
      return (recordId: string, objectNameSingular: string) => {
        openCommandMenu();
        set(commandMenuPageState, CommandMenuPages.ViewRecord);
        set(viewableRecordNameSingularState, objectNameSingular);
        set(viewableRecordIdState, recordId);
      };
    },
    [openCommandMenu],
  );

  const setGlobalCommandMenuContext = useRecoilCallback(({ set }) => {
    return () => {
      set(
        contextStoreTargetedRecordsRuleComponentState.atomFamily({
          instanceId: 'command-menu',
        }),
        {
          mode: 'selection',
          selectedRecordIds: [],
        },
      );

      set(
        contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
          instanceId: 'command-menu',
        }),
        0,
      );

      set(
        contextStoreCurrentViewTypeComponentState.atomFamily({
          instanceId: 'command-menu',
        }),
        null,
      );
    };
  }, []);

  return {
    openCommandMenu,
    closeCommandMenu,
    openRecordInCommandMenu,
    toggleCommandMenu,
    resetCommandMenuContext: setGlobalCommandMenuContext,
  };
};
