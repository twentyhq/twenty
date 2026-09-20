import {
  defineField,
  FieldType,
  OnDeleteAction,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CLIENT_COMPANY_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: CLIENT_COMPANY_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier: INVOICE_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'clientCompany',
  label: 'Client company',
  description: 'The client, when they are a business rather than an individual.',
  icon: 'IconBuilding',
  relationTargetObjectMetadataUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier:
    INVOICES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'clientCompanyId',
  },
});
