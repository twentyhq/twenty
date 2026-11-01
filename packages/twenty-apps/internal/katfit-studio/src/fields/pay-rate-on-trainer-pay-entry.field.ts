import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '22e10284-a48a-4680-80d8-7ff8fc239d62';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'payRate',
  label: 'Тариф',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '918b7673-38b2-46a7-a668-b2737a93a4a1',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.RESTRICT,
    joinColumnName: 'payRateId',
  },
});
