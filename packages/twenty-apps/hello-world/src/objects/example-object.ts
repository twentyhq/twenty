import { defineObject, FieldType } from 'twenty-sdk';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  'dfd43356-39b3-4b55-b4a7-279bec689928';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  'd2d7f6cd-33f6-456f-bf00-17adeca926ba';

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
