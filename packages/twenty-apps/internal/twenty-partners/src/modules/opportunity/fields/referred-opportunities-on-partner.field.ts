import { FieldType, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';
import { REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID, REFERRED_OPPORTUNITIES_ON_PARTNER_FIELD_ID } from './referred-by-partner-on-opportunity.field';

export default defineField({
  universalIdentifier: REFERRED_OPPORTUNITIES_ON_PARTNER_FIELD_ID,
  objectUniversalIdentifier: PARTNER_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'referredOpportunities',
  label: 'Referred opportunities',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: REFERRED_BY_PARTNER_ON_OPPORTUNITY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.ONE_TO_MANY,
  },
});
