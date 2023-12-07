import { Activity } from '@/activities/types/Activity';
import { FilterDefinitionByEntity } from '@/object-record/object-filter-dropdown/types/FilterDefinitionByEntity';
import { IconUserCircle } from '@/ui/display/icon';

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
