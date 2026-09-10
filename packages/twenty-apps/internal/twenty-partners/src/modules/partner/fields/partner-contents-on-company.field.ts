import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_CONTENTS_ON_COMPANY_FIELD_ID, PARTNER_CONTENT_CUSTOMER_COMPANY_FIELD_ID } from './partner-content-customer-company.field';

export default defineField({
  universalIdentifier: PARTNER_CONTENTS_ON_COMPANY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.company.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerContents',
  label: 'Partner Content',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_CONTENT_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_CONTENT_CUSTOMER_COMPANY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
