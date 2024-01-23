import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';

import { tasksFilterDefinitions } from './tasks-filter-definitions';

type TasksEffectProps = {
  filterDropdownId: string;
};

export const TasksEffect = ({ filterDropdownId }: TasksEffectProps) => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const {
    setSelectedFilter,
    setAvailableFilterDefinitions,
    setObjectFilterDropdownSelectedRecordIds,
  } = useFilterDropdown({
    filterDropdownId: filterDropdownId,
  });

  useEffect(() => {
    setAvailableFilterDefinitions(tasksFilterDefinitions);
  }, [setAvailableFilterDefinitions]);

  useEffect(() => {
    if (currentWorkspaceMember) {
      setSelectedFilter({
        fieldMetadataId: 'assigneeId',
        value: JSON.stringify(currentWorkspaceMember.id),
        operand: ViewFilterOperand.Is,
        displayValue:
          currentWorkspaceMember.name?.firstName +
          ' ' +
          currentWorkspaceMember.name?.lastName,
        displayAvatarUrl: currentWorkspaceMember.avatarUrl ?? undefined,
        definition: tasksFilterDefinitions[0],
      });

      setObjectFilterDropdownSelectedRecordIds([currentWorkspaceMember.id]);
    }
  }, [
    currentWorkspaceMember,
    setSelectedFilter,
    setObjectFilterDropdownSelectedRecordIds,
  ]);
  return <></>;
};
