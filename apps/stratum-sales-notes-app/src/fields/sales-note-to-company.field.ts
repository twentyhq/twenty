// salesNote → Company (MANY_TO_ONE)
import {
  COMPANY_OBJECT_UID,
  COMPANY_TO_SALES_NOTES_FIELD_UID,
  SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  SALES_NOTE_TO_COMPANY_FIELD_UID,
} from 'src/constants/universal-identifiers';
import { defineField, FieldType, RelationType } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: SALES_NOTE_TO_COMPANY_FIELD_UID,
  objectUniversalIdentifier: SALES_NOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'company',
  label: 'Account',
  description: 'Account (Company) this note relates to',
  icon: 'IconBuildingSkyscraper',
  relationTargetObjectMetadataUniversalIdentifier: COMPANY_OBJECT_UID,
  relationTargetFieldMetadataUniversalIdentifier:
    COMPANY_TO_SALES_NOTES_FIELD_UID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'companyId',
  },
});
