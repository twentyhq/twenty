// salesNote → Opportunity (MANY_TO_ONE)
import {
  OPPORTUNITY_OBJECT_UID,
  OPPORTUNITY_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SALES_NOTE_TO_OPPORTUNITY_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Opportunity',
  description: 'Opportunity this note relates to (optional)',
  icon: 'IconTargetArrow',
  relationTargetObjectMetadataUniversalIdentifier: OPPORTUNITY_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    OPPORTUNITY_TO_SALES_NOTES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'opportunityId',
  },
});
