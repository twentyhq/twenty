import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconColumnInsertRight, IconDotsVertical } from 'twenty-ui/display';

export const useCommandMenu = () => {
  const store = useStore();
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeCommandMenu = useCallback(() => {
    const isCommandMenuOpened = store.get(isCommandMenuOpenedState.atom);

    if (isCommandMenuOpened) {
      store.set(addToNavPayloadRegistryState.atom, new Map());
      store.set(isCommandMenuOpenedState.atom, false);
      store.set(isCommandMenuClosingState.atom, true);
      closeAnyOpenDropdown();
      removeFocusItemFromFocusStackById({
        focusId: SIDE_PANEL_FOCUS_ID,
      });
    }
  }, [closeAnyOpenDropdown, removeFocusItemFromFocusStackById, store]);

  const openCommandMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    const isNavigationMenuInEditMode = store.get(
      isNavigationMenuInEditModeState.atom,
    );
    const selectedNavigationItemId = store.get(
      selectedNavigationMenuItemInEditModeState.atom,
    );
    if (isNavigationMenuInEditMode && isDefined(selectedNavigationItemId)) {
      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuItemEdit,
        pageTitle: t`Edit`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    } else if (isNavigationMenuInEditMode) {
      navigateCommandMenu({
        page: CommandMenuPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconColumnInsertRight,
        resetNavigationStack: true,
      });
    } else {
      navigateCommandMenu({
        page: CommandMenuPages.Root,
        pageTitle: t`Command Menu`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    }
  }, [closeAnyOpenDropdown, navigateCommandMenu, store]);

  const toggleCommandMenu = useCallback(() => {
    const isCommandMenuOpened = store.get(isCommandMenuOpenedState.atom);

    store.set(commandMenuSearchState.atom, '');

    if (isCommandMenuOpened) {
      closeCommandMenu();
    } else {
      openCommandMenu();
    }
  }, [closeCommandMenu, openCommandMenu, store]);

  return {
    openCommandMenu,
    closeCommandMenu,
    navigateCommandMenu,
    toggleCommandMenu,
  };
};
