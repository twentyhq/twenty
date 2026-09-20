import {
  defineField,
  FieldType,
  RelationType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import {
  CLIENT_COMPANY_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  INVOICE_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineField({
  universalIdentifier: INVOICES_ON_COMPANY_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'invoices',
  label: 'Invoices',
  icon: 'IconFileInvoice',
  relationTargetObjectMetadataUniversalIdentifier: INVOICE_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier:
    CLIENT_COMPANY_ON_INVOICE_FIELD_UNIVERSAL_IDENTIFIER,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
