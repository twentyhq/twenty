import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

enum PersonType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  AGENT = 'AGENT',
}

export const PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER =
  'ea97d102-34e9-40bb-bbad-556a6456016a';

export default defineField({
  universalIdentifier: PERSON_TYPE_FIELD_UNIVERSAL_IDENTIFIER,
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.SELECT,
  name: 'personType',
  label: 'Person type',
  description: 'Role of this person in the real estate flow',
  icon: 'IconUserCog',
  isNullable: true,
  options: [
    {
      id: 'e6bdb2bf-c5d4-48ae-8781-30caf34e313f',
      value: PersonType.BUYER,
      label: 'Buyer',
      position: 0,
      color: 'blue',
    },
    {
      id: '3312451e-bd22-4e01-bec2-ee30ecd60cf0',
      value: PersonType.SELLER,
      label: 'Seller',
      position: 1,
      color: 'purple',
    },
    {
      id: 'e3975fa7-d15f-4e4c-88f5-6de99cd20f4e',
      value: PersonType.AGENT,
      label: 'Agent',
      position: 2,
      color: 'green',
    },
  ],
});
