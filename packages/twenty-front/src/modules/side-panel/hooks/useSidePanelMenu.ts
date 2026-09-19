import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useResetRecordIndexSelection } from '@/object-record/record-index/hooks/useResetRecordIndexSelection';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { isSidePanelClosingState } from '@/side-panel/states/isSidePanelClosingState';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelSearchObjectFilterState } from '@/side-panel/states/sidePanelSearchObjectFilterState';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { restoreNavigationDrawerAfterInboxPanel } from '@/inbox/utils/restoreNavigationDrawerAfterInboxPanel';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/side-panel/utils/emitSidePanelOpenEvent';
import { waitForSidePanelClose } from '@/ui/layout/side-panel/utils/waitForSidePanelClose';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/icon';

export const useSidePanelMenu = () => {
  const store = useStore();
  const { navigateSidePanel } = useNavigateSidePanel();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();
  const { resetRecordIndexSelection } = useResetRecordIndexSelection(
    MAIN_CONTEXT_STORE_INSTANCE_ID,
  );

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeSidePanelMenu = useCallback(async () => {
    const isSidePanelOpened = store.get(isSidePanelOpenedState.atom);

    if (!isSidePanelOpened) {
      return;
    }

    const isLayoutCustomizationModeEnabled = store.get(
      isLayoutCustomizationModeEnabledState.atom,
    );

    if (isLayoutCustomizationModeEnabled) {
      resetRecordIndexSelection();
    }

    store.set(isSidePanelOpenedState.atom, false);
    store.set(isSidePanelClosingState.atom, true);
    restoreNavigationDrawerAfterInboxPanel(store);
    closeAnyOpenDropdown();
    removeFocusItemFromFocusStackById({
      focusId: SIDE_PANEL_FOCUS_ID,
    });

    await waitForSidePanelClose();
  }, [
    closeAnyOpenDropdown,
    removeFocusItemFromFocusStackById,
    store,
    resetRecordIndexSelection,
  ]);

  const openSidePanelMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    store.set(sidePanelSearchState.atom, '');
    store.set(sidePanelSearchObjectFilterState.atom, null);

    navigateSidePanel({
      page: SidePanelPages.CommandMenuDisplay,
      pageTitle: t`Command Menu`,
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
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
