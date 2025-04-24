import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';

import { COMMAND_MENU_COMPONENT_INSTANCE_ID } from '@/command-menu/constants/CommandMenuComponentInstanceId';
import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useCallback } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();
  const { goBackToPreviousHotkeyScope } = usePreviousHotkeyScope(
    COMMAND_MENU_COMPONENT_INSTANCE_ID,
  );

  const closeCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuOpenedState, false);
        set(isCommandMenuClosingState, true);
        set(isDragSelectionStartEnabledState, true);
        closeAnyOpenDropdown();
        goBackToPreviousHotkeyScope();
      },
    [closeAnyOpenDropdown, goBackToPreviousHotkeyScope],
  );

  const openCommandMenu = useCallback(() => {
    navigateCommandMenu({
      page: CommandMenuPages.Root,
      pageTitle: 'Command Menu',
      pageIcon: IconDotsVertical,
      resetNavigationStack: true,
    });
  }, [navigateCommandMenu]);

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
