import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/side-panel/utils/emitSidePanelOpenEvent';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconColumnInsertRight, IconDotsVertical } from 'twenty-ui/display';

export const useSidePanelMenu = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeSidePanelMenu = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    if (isSidePanelOpened) {
      store.set(sidePanelNavigationStackState.atom, []);
      store.set(isSidePanelOpenedState.atom, false);
      store.set(isSidePanelClosingState.atom, true);
      closeAnyOpenDropdown();
      removeFocusItemFromFocusStackById({
        focusId: SIDE_PANEL_FOCUS_ID,
      });
    }
  }, [closeAnyOpenDropdown, removeFocusItemFromFocusStackById, store]);

  const openSidePanelMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    const isLayoutCustomizationModeEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );
    const selectedNavigationItemId = store.get(
      selectedNavigationMenuItemIdInEditModeState.atom,
    );
    if (
      isLayoutCustomizationModeEnabled &&
      isDefined(selectedNavigationItemId)
    ) {
      navigateSidePanel({
        page: SidePanelPages.NavigationMenuItemEdit,
        pageTitle: t`Edit`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    } else if (isLayoutCustomizationModeEnabled) {
      navigateSidePanel({
        page: SidePanelPages.NavigationMenuAddItem,
        pageTitle: t`New menu item`,
        pageIcon: IconColumnInsertRight,
        resetNavigationStack: true,
      });
    } else {
      navigateSidePanel({
        page: SidePanelPages.CommandMenuDisplay,
        pageTitle: t`Command Menu`,
        pageIcon: IconDotsVertical,
        resetNavigationStack: true,
      });
    }
  }, [closeAnyOpenDropdown, navigateSidePanel, store]);

  const navigateSidePanelMenu = navigateSidePanel;

  const toggleSidePanelMenu = useCallback(() => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    store.set(sidePanelSearchState.atom, '');
    store.set(sidePanelSearchObjectFilterState.atom, null);

    if (isSidePanelOpened) {
      closeSidePanelMenu();
    } else {
      openSidePanelMenu();
    }
  }, [closeSidePanelMenu, openSidePanelMenu, store]);

  return {
    openSidePanelMenu,
    closeSidePanelMenu,
    navigateSidePanelMenu,
    toggleSidePanelMenu,
  };
};
