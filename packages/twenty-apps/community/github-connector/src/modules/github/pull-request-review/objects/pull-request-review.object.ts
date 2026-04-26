import { defineObject, FieldType } from 'twenty-sdk/define';

export const PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER =
  '3c9b62b5-88a6-4a05-8e62-7637987cc8bb';

export const REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER =
  '0d0f01f1-bdb2-4dc9-a915-a2eacecdedce';

export const REVIEW_KEY_FIELD_UNIVERSAL_IDENTIFIER =
  'f96c80a8-d42f-414e-8eab-5c5684c0b948';

export const REVIEW_STATE_FIELD_UNIVERSAL_IDENTIFIER =
  'b93fabcc-67ea-4532-847c-2b015fe90ee5';

export const REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'd7157b19-b173-41ca-96a5-98b7cc4f379e';

export const REVIEW_LAST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'ea73e23e-6010-4cb4-b9e0-9dfe572e4b69';

export const REVIEW_EVENT_COUNT_FIELD_UNIVERSAL_IDENTIFIER =
  '5bca3165-8033-41da-96bb-bf381e6db45f';

export const PULL_REQUEST_REVIEW_CREATED_AT_FIELD_UNIVERSAL_IDENTIFIER =
  'b4d61187-1b78-5d6e-9752-79f994ff6d55';

export const REVIEW_IS_SELF_REVIEW_FIELD_UNIVERSAL_IDENTIFIER =
  'c1f3e8a2-9b5d-4e7f-8a6c-2d4b6f8e1a93';

enum ReviewState {
  APPROVED = 'APPROVED',
  CHANGES_REQUESTED = 'CHANGES_REQUESTED',
  COMMENTED = 'COMMENTED',
  DISMISSED = 'DISMISSED',
}

export default defineObject({
  universalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  nameSingular: 'pullRequestReview',
  namePlural: 'pullRequestReviews',
  labelSingular: 'Pull Request Review',
  labelPlural: 'Pull Request Reviews',
  icon: 'IconEye',
  labelIdentifierFieldMetadataUniversalIdentifier:
    REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: REVIEW_TITLE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'title',
      type: FieldType.TEXT,
      label: 'Title',
      icon: 'IconTextCaption',
    },
    {
      universalIdentifier: REVIEW_KEY_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'reviewKey',
      type: FieldType.TEXT,
      label: 'Review Key',
      icon: 'IconKey',
      isUnique: true,
    },
    {
      universalIdentifier: REVIEW_STATE_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'state',
      type: FieldType.SELECT,
      label: 'State',
      icon: 'IconCircleDot',
      options: [
        {
          value: ReviewState.APPROVED,
          label: 'Approved',
          position: 0,
          color: 'green',
        },
        {
          value: ReviewState.CHANGES_REQUESTED,
          label: 'Changes Requested',
          position: 1,
          color: 'red',
        },
        {
          value: ReviewState.COMMENTED,
          label: 'Commented',
          position: 2,
          color: 'blue',
        },
        {
          value: ReviewState.DISMISSED,
          label: 'Dismissed',
          position: 3,
          color: 'gray',
        },
      ],
    },
    {
      universalIdentifier:
        REVIEW_FIRST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'firstSubmittedAt',
      type: FieldType.DATE_TIME,
      label: 'First Submitted At',
      icon: 'IconCalendar',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: REVIEW_LAST_SUBMITTED_AT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'lastSubmittedAt',
      type: FieldType.DATE_TIME,
      label: 'Last Submitted At',
      icon: 'IconCalendarTime',
      isNullable: true,
      defaultValue: null,
    },
    {
      universalIdentifier: REVIEW_EVENT_COUNT_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'eventCount',
      type: FieldType.NUMBER,
      label: 'Event Count',
      icon: 'IconHash',
      defaultValue: 0,
    },
    {
      universalIdentifier: REVIEW_IS_SELF_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
      name: 'isSelfReview',
      type: FieldType.BOOLEAN,
      label: 'Self review',
      description:
        'True when the reviewer is the same contributor as the PR author. Self reviews are excluded from review-count aggregations (top reviewers, contributor stats, etc.) so contributors are credited only for reviews on other people\u2019s PRs.',
      icon: 'IconUserCheck',
      defaultValue: false,
    },
  ],
});
