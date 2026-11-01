import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-rate-assignment.object';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '9215e366-a4ad-472e-a83f-f0a18d37a08f';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    TRAINER_RATE_ASSIGNMENT_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'trainer',
  label: 'Тренер',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '9edd36f5-037f-4fee-90d9-75e01b955b18',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.RESTRICT,
    joinColumnName: 'trainerId',
  },
});
