import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuPageState } from '@/command-menu/states/commandMenuPageState';
import { commandMenuPageInfoState } from '@/command-menu/states/commandMenuPageTitle';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilCallback } from 'recoil';
import { IconSearch } from 'twenty-ui';

export const useSearchRecordsRecordAgnosticAction = () => {
  const { openCommandMenu } = useCommandMenu();

  const onClick = useRecoilCallback(
    ({ set }) =>
      () => {
        set(commandMenuPageState, CommandMenuPages.SearchRecords);
        set(commandMenuPageInfoState, {
          title: 'Search',
          Icon: IconSearch,
        });
        openCommandMenu();
      },
    [openCommandMenu],
  );

  return {
    onClick,
    shouldBeRegistered: true,
  };
};
