import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { AUTOMATION_TRIGGER_OBJECT_ID } from '../objects/automation-trigger.object';
import { EMAIL_SEQUENCE_OBJECT_ID } from '../objects/email-sequence.object';

export const TRIGGERS_ON_EMAIL_SEQUENCE_FIELD_ID = 'aa596037-b2cc-435e-83c1-0bf2c0e9bc91';
export const EMAIL_SEQUENCE_ON_TRIGGER_FIELD_ID = 'f01ce311-03df-43f9-9aa8-287b10da075b';

export default defineField({
  universalIdentifier: TRIGGERS_ON_EMAIL_SEQUENCE_FIELD_ID,
  objectUniversalIdentifier: EMAIL_SEQUENCE_OBJECT_ID,
  type: FieldType.RELATION,
  name: 'automationTriggers',
  label: 'Automation triggers',
  relationTargetObjectMetadataUniversalIdentifier: AUTOMATION_TRIGGER_OBJECT_ID,
  relationTargetFieldMetadataUniversalIdentifier: EMAIL_SEQUENCE_ON_TRIGGER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
