import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { IconUser } from '@/ui/icon';
import { FilterDefinitionByEntity } from '@/ui/view-bar/types/FilterDefinitionByEntity';
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
  },
];
