import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_DESIGN_DOC_URL_FIELD_ID = '37e5428c-6c8c-4616-b626-f0ea1caa443d';

export default defineField({
  universalIdentifier: OPPORTUNITY_DESIGN_DOC_URL_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.LINKS,
  name: 'designDocUrl',
  label: 'Design Doc URL',
  isNullable: true,
});
