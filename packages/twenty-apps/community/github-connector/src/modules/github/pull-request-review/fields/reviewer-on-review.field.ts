import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { REVIEWS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/fields/reviews-on-contributor.field';

export const REVIEWER_FIELD_UNIVERSAL_IDENTIFIER =
  '2272ecc4-90e1-4c66-96bd-a7ac20280943';

export default defineField({
  universalIdentifier: REVIEWER_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviewer',
  label: 'Reviewer',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEWS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'reviewerId',
  },
});
