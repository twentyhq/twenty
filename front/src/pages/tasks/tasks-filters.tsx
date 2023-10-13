import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { FilterDefinitionByEntity } from '@/ui/Data/View Bar/types/FilterDefinitionByEntity';
import { IconUser, IconUserCircle } from '@/ui/Display/Icon';
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
