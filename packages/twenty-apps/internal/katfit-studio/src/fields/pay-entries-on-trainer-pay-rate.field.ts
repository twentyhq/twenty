import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '918b7673-38b2-46a7-a668-b2737a93a4a1';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'payEntries',
  label: 'Начисления',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '22e10284-a48a-4680-80d8-7ff8fc239d62',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
