import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export default defineField({
  universalIdentifier: '0848a386-1f00-421e-9a22-b2712a887b59',
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.DATE_TIME,
  name: 'lastRelanceSentAt',
  label: 'Last Relance Sent At',
  isNullable: true,
});
