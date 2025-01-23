import { useRecoilCallback, useRecoilValue } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { useSelectableList } from '@/ui/layout/selectable-list/hooks/useSelectableList';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { AppHotkeyScope } from '@/ui/utilities/hotkey/types/AppHotkeyScope';

import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { useCopyContextStoreStates } from '@/command-menu/hooks/useCopyContextStoreAndActionMenuStates';
import { useResetContextStoreStates } from '@/command-menu/hooks/useResetContextStoreStates';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
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

  const { copyContextStoreStates } = useCopyContextStoreStates();
  const { resetContextStoreStates } = useResetContextStoreStates();

  const openCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        copyContextStoreStates({
          instanceIdToCopy: mainContextStoreComponentInstanceId,
          instanceIdToCopyTo: 'command-menu',
        });

        set(isCommandMenuOpenedState, true);
        setHotkeyScopeAndMemorizePreviousScope(AppHotkeyScope.CommandMenuOpen);
      },
    [
      copyContextStoreStates,
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
          resetContextStoreStates('command-menu');

          set(viewableRecordIdState, null);
          set(commandMenuPageState, CommandMenuPages.Root);
          set(commandMenuPageInfoState, {
            title: undefined,
            Icon: undefined,
          });
          set(isCommandMenuOpenedState, false);
          resetSelectedItem();
          goBackToPreviousHotkeyScope();

          emitRightDrawerCloseEvent();
        }
      },
    [goBackToPreviousHotkeyScope, resetContextStoreStates, resetSelectedItem],
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

  const setGlobalCommandMenuContext = useRecoilCallback(
    ({ set }) => {
      return () => {
        copyContextStoreStates({
          instanceIdToCopy: 'command-menu',
          instanceIdToCopyTo: 'command-menu-previous',
        });

        resetContextStoreStates('command-menu');

        set(commandMenuPageInfoState, {
          title: undefined,
          Icon: undefined,
        });
      };
    },
    [copyContextStoreStates, resetContextStoreStates],
  );

  return {
    openCommandMenu,
    closeCommandMenu,
    openRecordInCommandMenu,
    toggleCommandMenu,
    setGlobalCommandMenuContext,
  };
};
