import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_TFT_ID_FIELD_ID = '2e3e1d04-2719-4e0d-9a6b-ec73acf896c5';

export default defineField({
  universalIdentifier: OPPORTUNITY_TFT_ID_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'tftOpportunityId',
  label: 'TfT Opportunity ID',
  isNullable: true,
});
