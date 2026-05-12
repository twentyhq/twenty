import { defineObject, FieldType } from 'twenty-sdk/define';

export const ISSUE_UNIVERSAL_IDENTIFIER =
  '3a4b5c6d-7e8f-4a9b-8c0d-1e2f3a4b5c6d';

export const ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  '4b5c6d7e-8f9a-4b0c-9d1e-2f3a4b5c6d7e';

export const ISSUE_GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER =
  '5c6d7e8f-9a0b-4c1d-ae2f-3a4b5c6d7e8f';

export const ISSUE_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER =
  '6d7e8f9a-0b1c-4d2e-bf3a-4b5c6d7e8f9a';

export const ISSUE_LABELS_FIELD_UNIVERSAL_IDENTIFIER =
  'dfd35d92-f4a3-44c5-b758-494c0882fcc8';

export const ISSUE_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '76364df9-6f5c-477d-bd99-97b6738df3bf';

export const ISSUE_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '48ac555b-73b7-4ce9-a264-251c8e06b4e9';

export const ISSUE_REPO_FIELD_UNIVERSAL_IDENTIFIER =
  '79c41cdc-912a-4e4d-b9de-3f2421bcb2fb';

export const ISSUE_UNIQUE_IDENTIFIER_FIELD_UNIVERSAL_IDENTIFIER =
  '0ca04207-4d74-4298-8238-59cdf685862b';

enum IssueState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
}

export const ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  '1c2d3e4f-5a6b-4c7d-a48e-9f0a1b2c3d4e';

export const ISSUE_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '440e9ba8-20d1-5843-91ef-3b7b699a59f4';

export default defineObject({
  universalIdentifier: ISSUE_UNIVERSAL_IDENTIFIER,
  nameSingular: 'issue',
  namePlural: 'issues',
  labelSingular: 'Issue',
  labelPlural: 'Issues',
  icon: 'IconBug',
  labelIdentifierFieldMetadataUniversalIdentifier:
    ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: ISSUE_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'title',
      type: FieldType.TEXT,
      label: 'Title',
      icon: 'IconTextCaption',
    },
    {
      universalIdentifier: ISSUE_GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubNumber',
      type: FieldType.NUMBER,
      label: 'Issue Number',
      icon: 'IconHash',
    },
    {
      universalIdentifier: ISSUE_GITHUB_URL_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubUrl',
      type: FieldType.LINKS,
      label: 'GitHub URL',
      icon: 'IconLink',
    },
    {
      universalIdentifier: ISSUE_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'state',
      type: FieldType.SELECT,
      label: 'State',
      icon: 'IconCircleDot',
      options: [
        {
          value: IssueState.OPEN,
          label: 'Open',
          position: 0,
          color: 'green',
        },
        {
          value: IssueState.CLOSED,
          label: 'Closed',
          position: 1,
          color: 'red',
        },
      ],
    },
    {
      universalIdentifier: ISSUE_LABELS_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'labels',
      type: FieldType.ARRAY,
      label: 'Labels',
      icon: 'IconTag',
    },
    {
      universalIdentifier: ISSUE_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubCreatedAt',
      type: FieldType.DATE_TIME,
      label: 'GitHub Created At',
      icon: 'IconCalendarPlus',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: ISSUE_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'closedAt',
      type: FieldType.DATE_TIME,
      label: 'Closed At',
      icon: 'IconCalendarOff',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: ISSUE_REPO_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'repo',
      type: FieldType.TEXT,
      label: 'Repository',
      icon: 'IconFolder',
    },
    {
      universalIdentifier: ISSUE_UNIQUE_IDENTIFIER_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'uniqueIdentifier',
      type: FieldType.TEXT,
      label: 'Unique Identifier',
      icon: 'IconFingerprint',
      isUnique: true,
    },
  ],
});
