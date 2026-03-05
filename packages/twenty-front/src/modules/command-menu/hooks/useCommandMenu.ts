import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import { isNavigationMenuInEditModeState } from '@/navigation-menu-item/states/isNavigationMenuInEditModeState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/side-panel/utils/emitSidePanelOpenEvent';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconColumnInsertRight, IconDotsVertical } from 'twenty-ui/display';

export const useCommandMenu = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeCommandMenu = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    if (isSidePanelOpened) {
      store.set(addToNavPayloadRegistryState.atom, new Map());
      store.set(isSidePanelOpenedState.atom, false);
      store.set(isSidePanelClosingState.atom, true);
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
      navigateSidePanel({
        page: SidePanelPages.NavigationMenuItemEdit,
        pageTitle: t`Edit`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    } else if (isNavigationMenuInEditMode) {
      navigateSidePanel({
        page: SidePanelPages.NavigationMenuAddItem,
        pageTitle: t`New sidebar item`,
        pageIcon: IconColumnInsertRight,
        resetNavigationStack: true,
      });
    } else {
      navigateSidePanel({
        page: SidePanelPages.Root,
        pageTitle: t`Command Menu`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    }
  }, [closeAnyOpenDropdown, navigateSidePanel, store]);

  const navigateCommandMenu = navigateSidePanel;

  const toggleCommandMenu = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    store.set(commandMenuSearchState.atom, '');

    if (isSidePanelOpened) {
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
