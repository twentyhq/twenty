import { FieldType, RelationType, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER, PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_QUOTES_ON_PARTNER_FIELD_ID, PARTNER_QUOTE_PARTNER_FIELD_ID } from './partner-quote-partner.field';

export default defineField({
  universalIdentifier: PARTNER_QUOTES_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'partnerQuotes',
  label: 'Partner Quotes',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_QUOTE_PARTNER_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
