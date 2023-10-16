import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { FilterDefinitionByEntity } from '@/ui/data/view-bar/types/FilterDefinitionByEntity';
import { IconUser, IconUserCircle } from '@/ui/display/icon';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Activity } from '~/generated/graphql';

export const tasksFilters: FilterDefinitionByEntity<Activity>[] = [
  {
    key: 'assigneeId',
    label: 'Assignee',
    Icon: IconUser,
    type: 'entity',
    entitySelectComponent: (
      <FilterDropdownUserSearchSelect context={TasksRecoilScopeContext} />
    ),
    selectAllLabel: 'All assignees',
    SelectAllIcon: IconUserCircle,
  },
];
