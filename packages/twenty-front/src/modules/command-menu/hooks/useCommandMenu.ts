import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { addToNavPayloadRegistryStateV2 } from '@/navigation-menu-item/states/addToNavPayloadRegistryStateV2';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconDotsVertical } from 'twenty-ui/display';

export const useCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const closeCommandMenu = useCallback(() => {
    const isCommandMenuOpened = jotaiStore.get(isCommandMenuOpenedStateV2.atom);

    if (isCommandMenuOpened) {
      jotaiStore.set(addToNavPayloadRegistryStateV2.atom, new Map());
      jotaiStore.set(isCommandMenuOpenedStateV2.atom, false);
      jotaiStore.set(isCommandMenuClosingState.atom, true);
      closeAnyOpenDropdown();
      removeFocusItemFromFocusStackById({
        focusId: SIDE_PANEL_FOCUS_ID,
      });
    }
  }, [closeAnyOpenDropdown, removeFocusItemFromFocusStackById]);

  const openCommandMenu = useCallback(() => {
    emitSidePanelOpenEvent();
    closeAnyOpenDropdown();
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: t`Command Menu`,
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
  }, [closeAnyOpenDropdown, navigateCommandMenu]);

  const toggleCommandMenu = useCallback(() => {
    const isCommandMenuOpened = jotaiStore.get(isCommandMenuOpenedStateV2.atom);

    jotaiStore.set(commandMenuSearchState.atom, '');

    if (isCommandMenuOpened) {
      closeCommandMenu();
    } else {
      openCommandMenu();
    }
  }, [closeCommandMenu, openCommandMenu]);

  return {
    openCommandMenu,
    closeCommandMenu,
    navigateCommandMenu,
    toggleCommandMenu,
  };
};
