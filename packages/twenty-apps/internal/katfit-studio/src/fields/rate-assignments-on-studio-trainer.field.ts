import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
import { TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-rate-assignment.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '9edd36f5-037f-4fee-90d9-75e01b955b18';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'rateAssignments',
  label: 'Назначения тарифов',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '9215e366-a4ad-472e-a83f-f0a18d37a08f',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
