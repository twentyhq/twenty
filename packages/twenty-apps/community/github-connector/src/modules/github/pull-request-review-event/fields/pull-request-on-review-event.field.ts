import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { REVIEW_EVENTS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/review-events-on-pull-request.field';

export const PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '8bd96f9d-fa6b-431a-9264-000097b580f8';

export default defineField({
  universalIdentifier: PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'pullRequest',
  label: 'Pull Request',
  icon: 'IconGitPullRequest',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEW_EVENTS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'pullRequestId',
  },
});
