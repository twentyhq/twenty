import { useRecoilCallback } from 'recoil';

import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { isCommandMenuClosingState } from '@/command-menu/states/isCommandMenuClosingState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useCloseAnyOpenDropdown } from '@/ui/layout/dropdown/hooks/useCloseAnyOpenDropdown';
import { isDragSelectionStartEnabledState } from '@/ui/utilities/drag-select/states/internal/isDragSelectionStartEnabledState';
import { useCallback } from 'react';
import { IconDotsVertical } from 'twenty-ui/display';
import { isCommandMenuOpenedState } from '../states/isCommandMenuOpenedState';

export const useCommandMenu = () => {
  const { navigateCommandMenu } = useNavigateCommandMenu();
  const { closeAnyOpenDropdown } = useCloseAnyOpenDropdown();

  const closeCommandMenu = useRecoilCallback(
    ({ set }) =>
      () => {
        set(isCommandMenuOpenedState, false);
        set(isCommandMenuClosingState, true);
        set(isDragSelectionStartEnabledState, true);
        closeAnyOpenDropdown();
      },
    [closeAnyOpenDropdown],
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
