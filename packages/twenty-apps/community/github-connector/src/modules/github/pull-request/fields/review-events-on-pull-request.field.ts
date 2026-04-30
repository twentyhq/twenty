import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { PULL_REQUEST_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request/objects/pull-request.object';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/fields/pull-request-on-review-event.field';

export const REVIEW_EVENTS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER =
  '299b3ef8-cba0-4f16-a785-81728df09c46';

export default defineField({
  universalIdentifier: REVIEW_EVENTS_ON_PR_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviewEvents',
  label: 'Review Events',
  icon: 'IconEye',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    PULL_REQUEST_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
