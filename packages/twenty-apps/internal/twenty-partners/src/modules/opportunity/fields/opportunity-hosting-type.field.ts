import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_HOSTING_TYPE_FIELD_ID = '7ac7517f-bbca-4b4c-8996-6f864f71219b';

export default defineField({
  universalIdentifier: OPPORTUNITY_HOSTING_TYPE_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.SELECT,
  name: 'hostingType',
  label: 'Hosting Type',
  isNullable: true,
  options: [
    { id: '42c108d7-a874-4d1f-be4c-e87edd08f3c7', value: 'CLOUD', label: 'Cloud', position: 0, color: 'sky' },
    { id: '0fe995f4-42de-4160-96af-b3e7d542dfdd', value: 'SELF_HOSTING', label: 'Self-hosting', position: 1, color: 'purple' },
  ],
});
