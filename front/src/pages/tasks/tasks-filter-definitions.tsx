import { Activity } from '@/activities/types/Activity';
import { IconUser, IconUserCircle } from '@/ui/display/icon';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';

export const tasksFilterDefinitions: FilterDefinitionByEntity<Activity>[] = [
  {
    fieldMetadataId: 'assigneeId',
    label: 'Assignee',
    Icon: IconUser,
    type: 'ENTITY',
    entitySelectComponent: <FilterDropdownUserSearchSelect />,
    selectAllLabel: 'All assignees',
    SelectAllIcon: IconUserCircle,
  },
];
