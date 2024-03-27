import { IconUserCircle } from 'twenty-ui';

import { Activity } from '@/activities/types/Activity';
import { FilterDefinitionByEntity } from '@/object-record/object-filter-dropdown/types/FilterDefinitionByEntity';

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
