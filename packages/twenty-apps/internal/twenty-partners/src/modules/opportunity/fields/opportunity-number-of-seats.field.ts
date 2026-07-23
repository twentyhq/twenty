import { FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS, defineField } from 'twenty-sdk/define';

export const OPPORTUNITY_NUMBER_OF_SEATS_FIELD_ID = '90c683ec-2365-4533-a187-7b9ae162b753';

export default defineField({
  universalIdentifier: OPPORTUNITY_NUMBER_OF_SEATS_FIELD_ID,
  objectUniversalIdentifier: STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.opportunity.universalIdentifier,
  type: FieldType.NUMBER,
  name: 'numberOfSeats',
  label: 'Number of Seats',
  isNullable: true,
});
