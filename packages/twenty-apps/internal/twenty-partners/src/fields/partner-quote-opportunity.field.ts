import { FieldType, OnDeleteAction, RelationType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

import { PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export const PARTNER_QUOTE_OPPORTUNITY_FIELD_ID = '36684f3e-f01a-4270-8f34-78966747dd64';
export const PARTNER_QUOTES_ON_OPPORTUNITY_FIELD_ID = '4857f339-a051-4cdb-bd8a-6219b933d1ce';

export default defineField({
  universalIdentifier: PARTNER_QUOTE_OPPORTUNITY_FIELD_ID,
  objectUniversalIdentifier: PARTNER_QUOTE_OBJECT_UNIVERSAL_IDENTIFIER,
  type: FieldType.RELATION,
  name: 'opportunity',
  label: 'Opportunity',
  isNullable: true,
  relationTargetObjectMetadataUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  relationTargetFieldMetadataUniversalIdentifier: PARTNER_QUOTES_ON_OPPORTUNITY_FIELD_ID,
  universalSettings: {
    relationType: RelationType.MANY_TO_ONE,
    onDelete: OnDeleteAction.SET_NULL,
    joinColumnName: 'opportunityId',
  },
});
