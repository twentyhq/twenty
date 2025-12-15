import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedState } from '@/command-menu/states/isCommandMenuOpenedState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { v4 } from 'uuid';
import { IconSearch } from 'twenty-ui/display';

export const useOpenRecordsSearchPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useRecoilValue(isCommandMenuOpenedState);

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
