import { defineField, FieldType, STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS } from 'twenty-sdk/define';

export const PERSON_XOPURE_AMBASSADOR_LEVEL_FIELD_ID =
  'a36d58d3-37f1-4129-92e1-d6d947d8b025';

export default defineField({
  universalIdentifier: PERSON_XOPURE_AMBASSADOR_LEVEL_FIELD_ID,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'xopureAmbassadorLevel',
  label: 'XO Pure ambassador level',
  description: 'Fast segmentation field for ambassador tier on person records.',
  icon: 'IconAward',
  isNullable: true,
  defaultValue: null,
  options: [
    { id: '7060a9e6-bc8d-43f1-bbc0-12afef2b0d88', value: 'SEED', label: 'Seed', position: 0, color: 'gray' },
    { id: '17e9df54-29b2-4a78-b8ca-955a3edbbd2d', value: 'BRONZE', label: 'Bronze', position: 1, color: 'orange' },
    { id: 'a9ea0737-aed6-47b2-8965-a167426c590d', value: 'SILVER', label: 'Silver', position: 2, color: 'gray' },
    { id: 'f4a8da4e-e268-4519-aa3d-b1b389977bbf', value: 'GOLD', label: 'Gold', position: 3, color: 'yellow' },
    { id: '5d33e13e-1087-49e6-ae0a-e1af0eb15aaf', value: 'PLATINUM', label: 'Platinum', position: 4, color: 'blue' },
    { id: '6d308ec4-747f-4c14-af6a-5900617823a5', value: 'ELITE', label: 'Elite', position: 5, color: 'purple' },
  ],
});
