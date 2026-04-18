import { defineField, FieldType } from 'twenty-sdk/define';
import { EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER } from 'src/objects/example-object';

export default defineField({
  objectUniversalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  universalIdentifier: 'be08a7c6-2586-4d91-9fa7-0a44e6eae30c',
  type: FieldType.NUMBER,
  name: 'priority',
  label: 'Priority',
  description: 'Priority level for the example item (1-10)',
});
