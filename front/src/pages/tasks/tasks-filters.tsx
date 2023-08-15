import { IconUser } from '@tabler/icons-react';

import { TasksRecoilScopeContext } from '@/activities/states/recoil-scope-contexts/TasksRecoilScopeContext';
import { FilterDefinitionByEntity } from '@/ui/filter-n-sort/types/FilterDefinitionByEntity';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Activity } from '~/generated/graphql';

export const tasksFilters: FilterDefinitionByEntity<Activity>[] = [
  {
    field: 'assigneeId',
    label: 'Assignee',
    icon: <IconUser />,
    type: 'entity',
    entitySelectComponent: (
      <FilterDropdownUserSearchSelect context={TasksRecoilScopeContext} />
    ),
  },
];
