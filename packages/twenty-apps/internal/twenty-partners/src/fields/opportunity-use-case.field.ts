import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_USE_CASE_FIELD_ID = '1bc57f52-a621-4243-ae3e-05c3f504b90c';

export default defineField({
  universalIdentifier: OPPORTUNITY_USE_CASE_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.TEXT,
  name: 'useCase',
  label: 'Use Case',
  isNullable: true,
});
