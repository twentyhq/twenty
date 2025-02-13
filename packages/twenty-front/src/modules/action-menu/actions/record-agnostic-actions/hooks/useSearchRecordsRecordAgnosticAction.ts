import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useSetRecoilState } from 'recoil';
import { IconSearch } from 'twenty-ui';

export const useSearchRecordsRecordAgnosticAction = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const setCommandMenuSearch = useSetRecoilState(commandMenuSearchState);

  const onClick = () => {
    setCommandMenuSearch('');

    navigateCommandMenu({
      page: CommandMenuPages.SearchRecords,
      pageTitle: 'Search',
      pageIcon: IconSearch,
    });
  };

  return {
    onClick,
    shouldBeRegistered: true,
  };
};
