import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { REVIEWER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/fields/reviewer-on-review.field';

export const REVIEWS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  '564e7f97-74dc-4e9b-a4bc-ed4215ab9ac7';

export default defineField({
  universalIdentifier: REVIEWS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviews',
  label: 'Reviews',
  icon: 'IconEye',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEWER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
