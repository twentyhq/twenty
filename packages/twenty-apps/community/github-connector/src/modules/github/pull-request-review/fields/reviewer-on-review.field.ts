import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { REVIEWS_ON_ENGINEER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/fields/reviews-on-engineer.field';

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
    ENGINEER_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEWS_ON_ENGINEER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'reviewerId',
  },
});
