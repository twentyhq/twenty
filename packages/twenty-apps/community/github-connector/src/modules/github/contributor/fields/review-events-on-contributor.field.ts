import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CONTRIBUTOR_UNIVERSAL_IDENTIFIER } from 'src/modules/github/contributor/objects/contributor.object';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/fields/reviewer-on-review-event.field';

export const REVIEW_EVENTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER =
  'e4f5a6b7-8c9d-4e0f-a1b2-c3d4e5f6a7b8';

export default defineField({
  universalIdentifier: REVIEW_EVENTS_ON_CONTRIBUTOR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CONTRIBUTOR_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviewEvents',
  label: 'Review Events',
  icon: 'IconEye',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
