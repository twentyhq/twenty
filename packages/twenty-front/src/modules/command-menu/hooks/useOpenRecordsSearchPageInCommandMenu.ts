import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { isCommandMenuOpenedStateV2 } from '@/command-menu/states/isCommandMenuOpenedStateV2';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { t } from '@lingui/core/macro';
import { CommandMenuPages } from 'twenty-shared/types';
import { IconSearch } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const useOpenRecordsSearchPageInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();
  const isCommandMenuOpened = useAtomStateValue(isCommandMenuOpenedStateV2);

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
