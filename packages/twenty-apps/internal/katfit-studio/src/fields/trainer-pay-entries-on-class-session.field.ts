import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  'a9c52ec8-22e6-4996-b631-261f8726ece5';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'trainerPayEntries',
  label: 'Начисления тренеру',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '52b95c63-6b75-4545-9c75-be2123f491f6',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
