import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-rate.object';
import { TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-rate-assignment.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  'dead9973-ed96-495d-8d85-d9cad2e06781';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TRAINER_PAY_RATE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'assignments',
  label: 'Назначения',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '3568f7b6-a7e6-4cad-8509-268dc1cd51eb',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
