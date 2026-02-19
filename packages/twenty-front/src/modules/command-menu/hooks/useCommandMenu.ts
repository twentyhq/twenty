import { useRecoilCallback } from 'recoil';

import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { addToNavPayloadRegistryStateV2 } from '@/navigation-menu-item/states/addToNavPayloadRegistryStateV2';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { useStore } from 'jotai';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';

export const useCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const { removeFocusItemFromFocusStackById } =
    useRemoveFocusItemFromFocusStackById();

  const store = useStore();

  const closeCommandMenu = useRecoilCallback(
    ({ set, snapshot }) =>
      () => {
        const isCommandMenuOpened = snapshot
          .getLoadable(isCommandMenuOpenedState)
          .getValue();

        if (isCommandMenuOpened) {
          store.set(addToNavPayloadRegistryStateV2.atom, new Map());
          set(isCommandMenuOpenedState, false);
          store.set(isCommandMenuOpenedStateV2.atom, false);
          set(isCommandMenuClosingState, true);
          closeAnyOpenDropdown();
          removeFocusItemFromFocusStackById({
            focusId: SIDE_PANEL_FOCUS_ID,
          });
        }
      },
    [closeAnyOpenDropdown, removeFocusItemFromFocusStackById, store],
  );

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

  return {
    openCommandMenu,
    closeCommandMenu,
    navigateCommandMenu,
    toggleCommandMenu,
  };
};
