import { defineObject, FieldType } from 'twenty-sdk';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  '7719a166-203b-407b-b77c-ddd2a76b5da3';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '771344a1-02fd-4798-8123-823a33ee90b0';

export default defineObject({
  universalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'exampleItem',
  namePlural: 'exampleItems',
  labelSingular: 'Example item',
  labelPlural: 'Example items',
  description: 'A sample custom object',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the example item',
      icon: 'IconAbc',
    },
  ],
});
