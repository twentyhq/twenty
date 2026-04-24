import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/objects/pull-request-review.object';
import { EVENTS_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review/fields/events-on-review.field';

export const REVIEW_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  '1bc4170d-e998-4aac-bfea-4a6145d7d707';

export default defineField({
  universalIdentifier: REVIEW_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'review',
  label: 'Review',
  icon: 'IconEye',
  relationTargetObjectMetadataUniversalIdentifier:
    PULL_REQUEST_REVIEW_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    EVENTS_ON_REVIEW_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'reviewId',
  },
});
