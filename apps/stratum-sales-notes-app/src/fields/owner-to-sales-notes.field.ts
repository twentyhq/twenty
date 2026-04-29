// WorkspaceMember → salesNotes (ONE_TO_MANY reverse)
import {
  OWNER_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_OWNER_FIELD_UID,
  WORKSPACE_MEMBER_OBJECT_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: OWNER_TO_SALES_NOTES_FIELD_UID,
  objectUniversalIdentifier: WORKSPACE_MEMBER_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'ownedSalesNotes',
  label: 'Sales notes (as owner)',
  description: 'Sales notes this workspace member is the author of',
  icon: 'IconNotebook',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: SALES_NOTE_TO_OWNER_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
