import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFilter } from '@/ui/object/object-filter-dropdown/hooks/useFilter';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { tasksFilterDefinitions } from './tasks-filter-definitions';

export const TasksEffect = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const { setSelectedFilter, setAvailableFilterDefinitions } = useFilter();

  useEffect(() => {
    setAvailableFilterDefinitions(tasksFilterDefinitions);
  }, [setAvailableFilterDefinitions]);

  useEffect(() => {
    if (currentWorkspaceMember) {
      setSelectedFilter({
        fieldMetadataId: 'assigneeId',
        value: currentWorkspaceMember.id,
        operand: ViewFilterOperand.Is,
        displayValue:
          currentWorkspaceMember.firstName +
          ' ' +
          currentWorkspaceMember.lastName,
        displayAvatarUrl: currentWorkspaceMember.avatarUrl ?? undefined,
        definition: tasksFilterDefinitions[0],
      });
    }
  }, [currentWorkspaceMember, setSelectedFilter]);
  return <></>;
};
