import { defineObject, FieldType } from 'twenty-sdk/define';

export const PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER =
  '7a8b9c0d-1e2f-4a3b-8c4d-5e6f7a8b9c0d';

export const REVIEW_EVENT_TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  '8b9c0d1e-2f3a-4b4c-9d5e-6f7a8b9c0d1e';

export const REVIEW_EVENT_GITHUB_REVIEW_ID_FIELD_UNIVERSAL_IDENTIFIER =
  '9c0d1e2f-3a4b-4c5d-ae6f-7a8b9c0d1e2f';

export const REVIEW_EVENT_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  '0d1e2f3a-4b5c-4d6e-bf7a-8b9c0d1e2f3a';

enum ReviewEventState {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  COMMENTED = 'COMMENTED',
  DISMISSED = 'DISMISSED',
}

export const REVIEW_EVENT_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  'e5eeeaab-4ea9-4f9f-873d-9c1c1473ddb3';

export const PULL_REQUEST_REVIEW_EVENT_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'fc577b22-c927-5b0e-9d6d-532dd41cf6d2';

export default defineObject({
  universalIdentifier: PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'pullRequestReviewEvent',
  namePlural: 'pullRequestReviewEvents',
  labelSingular: 'Pull Request Review Event',
  labelPlural: 'Pull Request Review Events',
  icon: 'IconEye',
  labelIdentifierFieldMetadataUniversalIdentifier:
    REVIEW_EVENT_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: REVIEW_EVENT_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'title',
      type: FieldType.TEXT,
      label: 'Title',
      icon: 'IconTextCaption',
    },
    {
      universalIdentifier:
        REVIEW_EVENT_GITHUB_REVIEW_ID_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'githubReviewId',
      type: FieldType.NUMBER,
      label: 'GitHub Review ID',
      icon: 'IconHash',
      isUnique: true,
    },
    {
      universalIdentifier: REVIEW_EVENT_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'state',
      type: FieldType.SELECT,
      label: 'State',
      icon: 'IconCircleDot',
      options: [
        {
          value: ReviewEventState.APPROVED,
          label: 'Approved',
          position: 0,
          color: 'green',
        },
        {
          value: ReviewEventState.CHANGES_REQUESTED,
          label: 'Changes Requested',
          position: 1,
          color: 'red',
        },
        {
          value: ReviewEventState.COMMENTED,
          label: 'Commented',
          position: 2,
          color: 'blue',
        },
        {
          value: ReviewEventState.DISMISSED,
          label: 'Dismissed',
          position: 3,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier: REVIEW_EVENT_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'submittedAt',
      type: FieldType.DATE_TIME,
      label: 'Submitted At',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
  ],
});
