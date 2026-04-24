import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { REVIEW_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/fields/review-on-review-event.field';

export const EVENTS_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER =
  '846f70d2-5a2b-41e1-b10c-628f874837f2';

export default defineField({
  universalIdentifier: EVENTS_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviewEvents',
  label: 'Review Events',
  icon: 'IconHistory',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEW_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
