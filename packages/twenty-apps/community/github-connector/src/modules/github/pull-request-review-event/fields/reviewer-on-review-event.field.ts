import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER } from 'src/modules/github/pull-request-review-event/objects/pull-request-review-event.object';
import { ENGINEER_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/objects/engineer.object';
import { REVIEW_EVENTS_ON_ENGINEER_FIELD_UNIVERSAL_IDENTIFIER } from 'src/modules/engineer/fields/review-events-on-engineer.field';

export const REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER =
  'f5a6b7c8-9d0e-4f1a-b2c3-d4e5f6a7b8c9';

export default defineField({
  universalIdentifier: REVIEWER_ON_REVIEW_EVENT_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: PULL_REQUEST_REVIEW_EVENT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'reviewer',
  label: 'Reviewer',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    ENGINEER_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    REVIEW_EVENTS_ON_ENGINEER_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'reviewerId',
  },
});
