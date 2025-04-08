import { Action } from '@/action-menu/actions/components/Action';
import { ActionType } from '@/action-menu/actions/types/ActionType';
import { ActionConfigContext } from '@/action-menu/contexts/ActionConfigContext';
import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { commandMenuSearchState } from '@/command-menu/states/commandMenuSearchState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useContext } from 'react';
import { useSetRecoilState } from 'recoil';
import { IconSearch } from 'twenty-ui/display';

export const SearchRecordsRecordAgnosticAction = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const setCommandMenuSearchState = useSetRecoilState(commandMenuSearchState);

  const actionConfig = useContext(ActionConfigContext);

  return (
    <Action
      onClick={() => {
        navigateCommandMenu({
          page: CommandMenuPages.SearchRecords,
          pageTitle: 'Search',
          pageIcon: IconSearch,
        });

        if (actionConfig?.type !== ActionType.Fallback) {
          setCommandMenuSearchState('');
        }
      }}
      preventCommandMenuClosing
    />
  );
};
