import { defineField, FieldType, OnDeleteAction, RelationType } from 'twenty-sdk/define';
import { AUTOMATION_TRIGGER_OBJECT_ID } from '../objects/automation-trigger.object';
import { EMAIL_SEQUENCE_OBJECT_ID } from '../objects/email-sequence.object';
import { EMAIL_SEQUENCE_ON_TRIGGER_FIELD_ID, TRIGGERS_ON_EMAIL_SEQUENCE_FIELD_ID } from './automation-triggers-on-email-sequence.field';

export default defineField({
  universalIdentifier: EMAIL_SEQUENCE_ON_TRIGGER_FIELD_ID,
  objectUniversalIdentifier: AUTOMATION_TRIGGER_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'emailSequence',
  label: 'Email sequence',
  relationTargetObjectMetadataUniversalIdentifier: EMAIL_SEQUENCE_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: TRIGGERS_ON_EMAIL_SEQUENCE_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'emailSequenceId',
  },
});
