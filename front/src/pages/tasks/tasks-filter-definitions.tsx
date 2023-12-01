import { Activity } from '@/activities/types/Activity';
import { IconUserCircle } from '@/ui/display/icon';
import { FilterDefinitionByEntity } from '@/ui/object/object-filter-dropdown/types/FilterDefinitionByEntity';

export const tasksFilterDefinitions: FilterDefinitionByEntity<Activity>[] = [
  {
    fieldMetadataId: 'assigneeId',
    label: 'Assignee',
    iconName: 'IconUser',
    type: 'RELATION',
    relationObjectMetadataNamePlural: 'workspaceMembers',
    relationObjectMetadataNameSingular: 'workspaceMember',
    selectAllLabel: 'All assignees',
    SelectAllIcon: IconUserCircle,
  },
];
