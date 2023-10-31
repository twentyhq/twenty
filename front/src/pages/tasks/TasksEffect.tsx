import { useEffect } from 'react';
import { useRecoilState } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useFilter } from '@/ui/object/filter/hooks/useFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { tasksFilterDefinitions } from './tasks-filter-definitions';

export const TasksEffect = () => {
  const [currentUser] = useRecoilState(currentUserState);
  const { setSelectedFilter, setAvailableFilterDefinitions } = useFilter();

  useEffect(() => {
    setAvailableFilterDefinitions(tasksFilterDefinitions);
  }, [setAvailableFilterDefinitions]);

  useEffect(() => {
    if (currentUser) {
      setSelectedFilter({
        fieldId: 'assigneeId',
        value: currentUser.id,
        operand: ViewFilterOperand.Is,
        displayValue: currentUser.displayName,
        displayAvatarUrl: currentUser.avatarUrl ?? undefined,
        definition: tasksFilterDefinitions[0],
      });
    }
  }, [currentUser, setSelectedFilter]);
  return <></>;
};
