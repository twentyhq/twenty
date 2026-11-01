import { defineField, FieldType, RelationType } from 'twenty-sdk/define';
import { STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/studio-trainer.object';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '63409a8e-31ab-4053-bfa4-8efbe33c8773';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: STUDIO_TRAINER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'classSessions',
  label: 'Занятия',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    'e6cd6419-2a02-4da1-b805-3ce12d66cde0',
  universalSettings: { relationType: RelationType.ONE_TO_MANY },
});
