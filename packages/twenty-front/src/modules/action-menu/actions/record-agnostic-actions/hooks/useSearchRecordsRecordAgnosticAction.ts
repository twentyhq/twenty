import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconSearch } from 'twenty-ui';
import { v4 } from 'uuid';

export const useSearchRecordsRecordAgnosticAction = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const onClick = () => {
    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconSearch,
      pageComponentInstanceId: v4(),
    });
  };

  return {
    onClick,
    shouldBeRegistered: true,
  };
};
