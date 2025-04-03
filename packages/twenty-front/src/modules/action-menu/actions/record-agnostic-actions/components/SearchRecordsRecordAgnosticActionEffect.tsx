import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useEffect } from 'react';
import { IconSearch } from 'twenty-ui';

export const SearchRecordsRecordAgnosticActionEffect = () => {
  const { navigateCommandMenu } = useCommandMenu();

  useEffect(() => {
    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconSearch,
    });
  }, [navigateCommandMenu]);

  return null;
};
