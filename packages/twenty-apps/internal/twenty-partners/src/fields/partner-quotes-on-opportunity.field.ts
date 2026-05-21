import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { PARTNER_QUOTES_ON_OPPORTUNITY_FIELD_ID, PARTNER_QUOTE_OPPORTUNITY_FIELD_ID } from './partner-quote-opportunity.field';

export default defineField({
  universalIdentifier: PARTNER_QUOTES_ON_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.RELATION,
  name: 'partnerQuotes',
  label: 'Partner Quotes',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_QUOTE_OPPORTUNITY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
