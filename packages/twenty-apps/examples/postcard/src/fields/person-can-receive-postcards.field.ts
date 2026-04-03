import {
  defineField,
  FieldType,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk';

// Field on existing company object
export default defineField({
  universalIdentifier: 'f922fdb8-10a9-4f11-a1d0-992a779f6dff',
  objectUniversalIdentifier:
    STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS.person.universalIdentifier,
  type: FieldType.BOOLEAN,
  name: 'canReceivePostcards',
  label: 'Can Receive Postcards',
  description: 'Whether the company can receive postcards',
  icon: 'IconMailbox',
  defaultValue: true,
});
