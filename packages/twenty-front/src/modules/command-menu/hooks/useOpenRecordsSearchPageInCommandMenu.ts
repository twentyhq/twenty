import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordsSearchPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useAtomStateValue(isCommandMenuOpenedState);

  const openRecordsSearchPage = () => {
    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: t`Search`,
      pageIcon: IconSearch,
      pageId: v4(),
      resetNavigationStack: isCommandMenuOpened,
    });
  };

  return {
    openRecordsSearchPage,
  };
};
