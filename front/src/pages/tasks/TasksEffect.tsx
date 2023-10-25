import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useFilter } from '@/ui/data/filter/hooks/useFilter';
import { ViewFilterOperand } from '~/generated/graphql';

import { tasksFilters } from './tasks-filters';

export const TasksEffect = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const { setSelectedFilters, setAvailableFilters } = useFilter();

  useEffect(() => {
    setAvailableFilters(tasksFilters);
  }, [setAvailableFilters]);

  useEffect(() => {
    if (currentUser) {
      setSelectedFilters([
        {
          key: 'assigneeId',
          type: 'entity',
          value: currentUser.id,
          operand: ViewFilterOperand.Is,
          displayValue: currentUser.displayName,
          displayAvatarUrl: currentUser.avatarUrl ?? undefined,
        },
      ]);
    }
  }, [currentUser, setSelectedFilters]);
  return <></>;
};
