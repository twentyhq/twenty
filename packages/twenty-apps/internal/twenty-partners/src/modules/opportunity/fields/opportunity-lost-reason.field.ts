import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_LOST_REASON_FIELD_ID = '834e233d-b171-409e-825f-77ac49b0f19d';

export default defineField({
  universalIdentifier: OPPORTUNITY_LOST_REASON_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'lostReason',
  label: 'Lost Reason',
  isNullable: true,
});
