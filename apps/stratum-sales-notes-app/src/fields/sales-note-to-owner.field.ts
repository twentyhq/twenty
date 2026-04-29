// salesNote → WorkspaceMember (owner / sales rep) (MANY_TO_ONE)
import {
  OWNER_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_OWNER_FIELD_UID,
  WORKSPACE_MEMBER_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SALES_NOTE_TO_OWNER_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'owner',
  label: 'Owner',
  description: 'Sales rep who wrote this note',
  icon: 'IconUserCircle',
  relationTargetObjectMetadataUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    OWNER_TO_SALES_NOTES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'ownerId',
  },
});
