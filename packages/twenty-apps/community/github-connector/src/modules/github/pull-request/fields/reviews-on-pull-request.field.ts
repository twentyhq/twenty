import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/fields/pull-request-on-review.field';

export const REVIEWS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER =
  '9a089f03-76fe-40ba-9a4d-39b84ba11d03';

export default defineField({
  universalIdentifier: REVIEWS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviews',
  label: 'Reviews',
  icon: 'IconEye',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PULL_REQUEST_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
