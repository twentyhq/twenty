// Company → salesNotes (ONE_TO_MANY reverse)
import {
  COMPANY_OBJECT_UID,
  COMPANY_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_COMPANY_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: COMPANY_TO_SALES_NOTES_FIELD_UID,
  objectUniversalIdentifier: COMPANY_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'salesNotes',
  label: 'Sales notes',
  description: 'Sales notes recorded against this account',
  icon: 'IconNotebook',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SALES_NOTE_TO_COMPANY_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
