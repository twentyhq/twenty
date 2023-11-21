import { Activity } from '@/activities/types/Activity';
import { IconUserCircle } from '@/ui/display/icon';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';
import { FilterDropdownUserSearchSelect } from '@/users/components/FilterDropdownUserSearchSelect';

export const tasksFilterDefinitions: FilterDefinitionByEntity<Activity>[] = [
  {
    fieldMetadataId: 'assigneeId',
    label: 'Assignee',
    iconName: 'IconUser',
    type: 'ENTITY',
    entitySelectComponent: <FilterDropdownUserSearchSelect />,
    selectAllLabel: 'All assignees',
    SelectAllIcon: IconUserCircle,
  },
];
