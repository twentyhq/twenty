import {
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  defineField,
} from 'twenty-sdk/define';

export const OPPORTUNITY_PARTNERS_PRESENTED_AT_FIELD_ID =
  '8e4fab21-6d3c-4f90-8b22-3c4d5e6f7081';

export default defineField({
  universalIdentifier: OPPORTUNITY_PARTNERS_PRESENTED_AT_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'partnersPresentedAt',
  label: 'Partners Presented At',
  isNullable: true,
});
