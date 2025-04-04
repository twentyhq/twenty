import { Action } from '@/action-menu/actions/components/Action';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { IconSearch } from 'twenty-ui';

export const SearchRecordsRecordAgnosticAction = () => {
  const { navigateCommandMenu } = useCommandMenu();

  return (
    <Action
      onClick={() => {
        navigateCommandMenu({
          page: CommandMenuPages.SearchRecords,
          pageTitle: 'Search',
          pageIcon: IconSearch,
        });
      }}
    />
  );
};
