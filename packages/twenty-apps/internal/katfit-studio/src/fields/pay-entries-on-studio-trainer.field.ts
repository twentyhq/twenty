import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '4932439e-716e-4a41-9ff3-4edf657f2d82';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'payEntries',
  label: 'Начисления',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '6d65e375-d40e-4fa3-9215-883814930262',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
