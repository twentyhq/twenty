import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { currentUserState } from '@/auth/states/currentUserState';
import { useRecoilScopedState } from '@/ui/utilities/recoil-scope/hooks/useRecoilScopedState';
import { availableFiltersScopedState } from '@/ui/view-bar/states/availableFiltersScopedState';
import { filtersScopedState } from '@/ui/view-bar/states/filtersScopedState';
import { FilterOperand } from '@/ui/view-bar/types/FilterOperand';

import { tasksFilters } from './tasks-filters';

export const TasksEffect = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const [, setFilters] = useRecoilScopedState(
    filtersScopedState,
    TasksRecoilScopeContext,
  );

  const [, setAvailableFilters] = useRecoilScopedState(
    availableFiltersScopedState,
    TasksRecoilScopeContext,
  );

  useEffect(() => {
    setAvailableFilters(tasksFilters);
  }, [setAvailableFilters]);

  useEffect(() => {
    if (currentUser) {
      setFilters([
        {
          key: 'assigneeId',
          type: 'entity',
          value: currentUser.id,
          operand: FilterOperand.Is,
          displayValue: currentUser.displayName,
          displayAvatarUrl: currentUser.avatarUrl ?? undefined,
        },
      ]);
    }
  }, [currentUser, setFilters]);
  return <></>;
};
