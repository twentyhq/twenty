import {
  defineField,
  FieldType,
  RelationType,
  OnDeleteAction,
} from 'twenty-sdk/define';
import { TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/trainer-pay-entry.object';
import { CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/class-session.object';

export const FIELD_UNIVERSAL_IDENTIFIER =
  '52b95c63-6b75-4545-9c75-be2123f491f6';
export default defineField({
  universalIdentifier: FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: TRAINER_PAY_ENTRY_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'classSession',
  label: 'Занятие',
  icon: 'IconUser',
  relationTargetObjectMetadataUniversalIdentifier:
    CLASS_SESSION_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    'a9c52ec8-22e6-4996-b631-261f8726ece5',
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.RESTRICT,
    joinColumnName: 'classSessionId',
  },
});
