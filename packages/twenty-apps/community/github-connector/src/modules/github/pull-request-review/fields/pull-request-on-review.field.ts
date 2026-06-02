import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { REVIEWS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/fields/reviews-on-pull-request.field';

export const PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '5cc6fd4f-400f-421b-8c24-ffbf08077dd8';

export default defineField({
  universalIdentifier: PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'pullRequest',
  label: 'Pull Request',
  icon: 'IconGitPullRequest',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEWS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.CASCADE,
    joinColumnName: 'pullRequestId',
  },
});
