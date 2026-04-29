// Opportunity → salesNotes (ONE_TO_MANY reverse)
import {
  OPPORTUNITY_OBJECT_UID,
  OPPORTUNITY_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: OPPORTUNITY_TO_SALES_NOTES_FIELD_UID,
  objectUniversalIdentifier: OPPORTUNITY_OBJECT_UID,
  type: FieldType.RELATION,
  name: 'salesNotes',
  label: 'Sales notes',
  description: 'Sales notes recorded against this opportunity',
  icon: 'IconNotebook',
  relationTargetObjectMetadataUniversalIdentifier:
    SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
