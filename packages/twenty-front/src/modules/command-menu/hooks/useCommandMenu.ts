import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';

import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuPersistentState } from '@/command-menu/states/isCommandMenuPersistentState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { useCallback } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeCommandMenu = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        const isCommandMenuPersistent = snapshot
          .getLoadable(isCommandMenuPersistentState)
          .getValue();

        // Don't close if in persistent mode
        if (isCommandMenuPersistent) {
          return;
        }

        if (isCommandMenuOpened) {
          set(isCommandMenuOpenedState, false);
          set(isCommandMenuClosingState, true);
          set(isDragSelectionStartEnabledState, true);
          closeAnyOpenDropdown();
          removeFocusItemFromFocusStackById({
            focusId: SIDE_PANEL_FOCUS_ID,
          });
        }
      },
    [closeAnyOpenDropdown, removeFocusItemFromFocusStackById],
  );

  const openCommandMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
  }, [closeAnyOpenDropdown, navigateCommandMenu]);

  const toggleCommandMenu = useRecoilCallback(
    ({ snapshot, set }) =>
      async () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        const isCommandMenuPersistent = snapshot
          .getLoadable(isCommandMenuPersistentState)
          .getValue();

        set(commandMenuSearchState, '');

        // Don't toggle if in persistent mode
        if (isCommandMenuPersistent) {
          return;
        }

        if (isCommandMenuOpened) {
          closeCommandMenu();
        } else {
          openCommandMenu();
        }
      },
    [closeCommandMenu, openCommandMenu],
  );

  const toggleCommandMenuPersistent = useRecoilCallback(
    ({ snapshot, set }) =>
      () => {
        const isCommandMenuPersistent = snapshot
          .getLoadable(isCommandMenuPersistentState)
          .getValue();

        const newPersistentState = !isCommandMenuPersistent;
        set(isCommandMenuPersistentState, newPersistentState);

        // If enabling persistent mode, ensure command menu is open
        if (newPersistentState) {
          set(isCommandMenuOpenedState, true);
          openCommandMenu();
        }
      },
    [openCommandMenu],
  );

  const enableCommandMenuPersistent = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuPersistentState, true);
        set(isCommandMenuOpenedState, true);
        openCommandMenu();
      },
    [openCommandMenu],
  );

  const disableCommandMenuPersistent = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuPersistentState, false);
        // Optionally close the menu when disabling persistent mode
        // set(isCommandMenuOpenedState, false);
      },
    [],
  );

  return {
    openCommandMenu,
    closeCommandMenu,
    navigateCommandMenu,
    toggleCommandMenu,
    toggleCommandMenuPersistent,
    enableCommandMenuPersistent,
    disableCommandMenuPersistent,
  };
};
