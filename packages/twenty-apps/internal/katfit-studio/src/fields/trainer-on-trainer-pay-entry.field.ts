import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '6d65e375-d40e-4fa3-9215-883814930262';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'trainer',
  label: 'Тренер',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    '4932439e-716e-4a41-9ff3-4edf657f2d82',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.RESTRICT,
    joinColumnName: 'trainerId',
  },
});
