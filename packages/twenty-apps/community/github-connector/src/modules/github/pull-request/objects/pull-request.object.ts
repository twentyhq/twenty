import { defineObject, FieldType } from 'twenty-sdk/define';

export const PULL_REQUEST_UNIVERSAL_IDENTIFIER =
  'bf539871-f118-4f35-b953-fa2ba528aea3';

export const PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '5b394c0a-14db-4582-9513-6671661d64a5';

export const MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '064b38ec-ae2e-4d1b-bae9-d8d18329c8cd';

export const GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER =
  'a4b5c6d7-8e9f-4a0b-b1c2-d3e4f5a6b7c8';

export const URL_FIELD_UNIVERSAL_IDENTIFIER =
  'd4c3b2a1-6f5e-4d3c-9b8a-7f6e5d4c3b2a';

export const PR_UNIQUE_IDENTIFIER_FIELD_UNIVERSAL_IDENTIFIER =
  '23b446f8-199a-4be4-881a-a475570b9590';

enum PullRequestState {
  OPEN = 'OPEN',
  CLOSED = 'CLOSED',
  MERGED = 'MERGED',
}

export const PR_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  'e4f5a6b7-0c1d-4e2f-a3b4-c5d6e7f8a9b0';

export const PR_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'f5a6b7c8-1d2e-4f3a-b4c5-d6e7f8a9b0c1';

export const PR_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'e38deee8-c57f-4b40-8c35-2b5d1fee759e';

export const PULL_REQUEST_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '78d142cf-7033-565d-b802-860bde5b0078';

export default defineObject({
  universalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  nameSingular: 'pullRequest',
  namePlural: 'pullRequests',
  labelSingular: 'Pull Request',
  labelPlural: 'Pull Requests',
  icon: 'IconTank',
  labelIdentifierFieldMetadataUniversalIdentifier:
    PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: PULL_REQUEST_NAME_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'name',
      type: FieldType.TEXT,
      label: 'Name',
      icon: 'IconGitPullRequest',
    },
    {
      universalIdentifier: GITHUB_NUMBER_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubNumber',
      type: FieldType.NUMBER,
      label: 'PR Number',
      icon: 'IconHash',
    },
    {
      universalIdentifier: URL_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'url',
      type: FieldType.LINKS,
      label: 'URL',
      icon: 'IconLink',
    },
    {
      universalIdentifier: PR_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'state',
      type: FieldType.SELECT,
      label: 'State',
      icon: 'IconCircleDot',
      options: [
        {
          value: PullRequestState.OPEN,
          label: 'Open',
          position: 0,
          color: 'green',
        },
        {
          value: PullRequestState.CLOSED,
          label: 'Closed',
          position: 1,
          color: 'red',
        },
        {
          value: PullRequestState.MERGED,
          label: 'Merged',
          position: 2,
          color: 'purple',
        },
      ],
    },
    {
      universalIdentifier: MERGED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'mergedAt',
      type: FieldType.DATE_TIME,
      label: 'Merged At',
      icon: 'IconCalendarCheck',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: PR_CLOSED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'closedAt',
      type: FieldType.DATE_TIME,
      label: 'Closed At',
      icon: 'IconCalendarOff',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: PR_GITHUB_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubCreatedAt',
      type: FieldType.DATE_TIME,
      label: 'GitHub Created At',
      icon: 'IconCalendarPlus',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: PR_UNIQUE_IDENTIFIER_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'uniqueIdentifier',
      type: FieldType.TEXT,
      label: 'Unique Identifier',
      icon: 'IconFingerprint',
      isUnique: true,
    },
  ],
});
