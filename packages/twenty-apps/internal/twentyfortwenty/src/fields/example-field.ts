import { defineField, FieldType } from 'twenty-sdk';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineField({
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  universalIdentifier: 'bf02a910-cea8-4bed-a563-638fc8113410',
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the example item (1-10)',
});
