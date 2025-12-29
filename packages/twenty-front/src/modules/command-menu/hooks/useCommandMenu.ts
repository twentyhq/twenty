import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';

import { COMMAND_MENU_SEARCH_INPUT_FOCUS_ID } from '@/command-menu/constants/CommandMenuSearchInputFocusId';
import { SIDE_PANEL_FOCUS_ID } from '@/command-menu/constants/SidePanelFocusId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { emitSidePanelOpenEvent } from '@/ui/layout/right-drawer/utils/emitSidePanelOpenEvent';
import { useRemoveFocusItemFromFocusStackById } from '@/ui/utilities/focus/hooks/useRemoveFocusItemFromFocusStackById';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';

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

        if (isCommandMenuOpened) {
          set(isCommandMenuOpenedState, false);
          set(isCommandMenuClosingState, true);
          closeAnyOpenDropdown();
          removeFocusItemFromFocusStackById({
            focusId: COMMAND_MENU_SEARCH_INPUT_FOCUS_ID,
          });
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
