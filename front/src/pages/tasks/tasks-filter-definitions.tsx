import { FilterDefinitionByEntity } from '@/ui/data/filter/types/FilterDefinitionByEntity';
import { IconUser, IconUserCircle } from '@/ui/display/icon';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';
import { Activity } from '~/generated/graphql';

export const tasksFilterDefinitions: FilterDefinitionByEntity<Activity>[] = [
  {
    fieldId: 'assigneeId',
    label: 'Assignee',
    Icon: IconUser,
    type: 'entity',
    entitySelectComponent: <FilterDropdownUserSearchSelect />,
    selectAllLabel: 'All assignees',
    SelectAllIcon: IconUserCircle,
  },
];
