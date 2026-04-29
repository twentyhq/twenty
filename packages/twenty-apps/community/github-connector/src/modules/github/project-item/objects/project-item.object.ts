import { defineObject, FieldType } from 'twenty-sdk/define';

export const PROJECT_ITEM_UNIVERSAL_IDENTIFIER =
  '1c4c36a5-586c-4ead-9f3e-5e9718ba6231';

export const PROJECT_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '215cdbbd-8606-4c13-9025-3ebe912eaa32';

export const PROJECT_ITEM_GITHUB_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '2d3e4f5a-6b7c-4d8e-af9b-0c1d2e3f4a5b';

export const PROJECT_ITEM_SPRINT_FIELD_UNIVERSAL_IDENTIFIER =
  'e3708df4-6b6b-45f6-83fb-9d47c5bc5a25';

export const PROJECT_ITEM_ASSIGNEES_FIELD_UNIVERSAL_IDENTIFIER =
  '3e4f5a6b-7c8d-4e9f-b0ac-1d2e3f4a5b6c';

export const PROJECT_ITEM_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER =
  '2db040a6-f2af-4e7d-9b70-d453f3cd99b7';

export const PROJECT_ITEM_REPO_FIELD_UNIVERSAL_IDENTIFIER =
  '589d6aeb-8384-4d52-9d71-d63b7fd94ec7';

enum ProjectItemStatus {
  NO_STATUS = 'NO_STATUS',
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  IN_REVIEW = 'IN_REVIEW',
  DONE = 'DONE',
}

export const PROJECT_ITEM_STATUS_FIELD_UNIVERSAL_IDENTIFIER =
  '54034cfc-83d9-478d-849c-98c91a819342';

enum ProjectItemPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export const PROJECT_ITEM_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER =
  '952a601c-b2da-4b84-9c7b-a9b42fcb7d95';

export const PROJECT_ITEM_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '597b4141-487f-5ad3-87c2-49f0a1679856';

export default defineObject({
  universalIdentifier: PROJECT_ITEM_UNIVERSAL_IDENTIFIER,
  nameSingular: 'projectItem',
  namePlural: 'projectItems',
  labelSingular: 'Project Item',
  labelPlural: 'Project Items',
  icon: 'IconLayoutKanban',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PROJECT_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: PROJECT_ITEM_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'name',
      type: FieldType.TEXT,
      label: 'Name',
      icon: 'IconTextCaption',
    },
    {
      universalIdentifier: PROJECT_ITEM_GITHUB_ID_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubProjectItemId',
      type: FieldType.TEXT,
      label: 'GitHub Item ID',
      icon: 'IconHash',
      isUnique: true,
    },
    {
      universalIdentifier: PROJECT_ITEM_STATUS_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'status',
      type: FieldType.SELECT,
      label: 'Status',
      icon: 'IconCircleDot',
      options: [
        {
          value: ProjectItemStatus.NO_STATUS,
          label: 'No Status',
          position: 0,
          color: 'gray',
        },
        {
          value: ProjectItemStatus.BACKLOG,
          label: 'Backlog',
          position: 1,
          color: 'gray',
        },
        {
          value: ProjectItemStatus.TODO,
          label: 'Todo',
          position: 2,
          color: 'blue',
        },
        {
          value: ProjectItemStatus.IN_PROGRESS,
          label: 'In Progress',
          position: 3,
          color: 'yellow',
        },
        {
          value: ProjectItemStatus.IN_REVIEW,
          label: 'In Review',
          position: 4,
          color: 'turquoise',
        },
        {
          value: ProjectItemStatus.DONE,
          label: 'Done',
          position: 5,
          color: 'green',
        },
      ],
    },
    {
      universalIdentifier: PROJECT_ITEM_SPRINT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'sprint',
      type: FieldType.TEXT,
      label: 'Sprint',
      icon: 'IconRun',
    },
    {
      universalIdentifier: PROJECT_ITEM_ASSIGNEES_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'assignees',
      type: FieldType.TEXT,
      label: 'Assignees',
      icon: 'IconUsers',
    },
    {
      universalIdentifier: PROJECT_ITEM_PRIORITY_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'priority',
      type: FieldType.SELECT,
      label: 'Priority',
      icon: 'IconFlag',
      options: [
        {
          value: ProjectItemPriority.LOW,
          label: 'Low',
          position: 0,
          color: 'green',
        },
        {
          value: ProjectItemPriority.MEDIUM,
          label: 'Medium',
          position: 1,
          color: 'turquoise',
        },
        {
          value: ProjectItemPriority.HIGH,
          label: 'High',
          position: 2,
          color: 'red',
        },
        {
          value: ProjectItemPriority.CRITICAL,
          label: 'Critical',
          position: 3,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: PROJECT_ITEM_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubUrl',
      type: FieldType.LINKS,
      label: 'GitHub URL',
      icon: 'IconLink',
    },
    {
      universalIdentifier: PROJECT_ITEM_REPO_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'repo',
      type: FieldType.TEXT,
      label: 'Repository',
      icon: 'IconFolder',
    },
  ],
});
