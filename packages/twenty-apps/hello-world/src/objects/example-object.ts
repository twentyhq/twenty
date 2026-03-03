import { defineObject, FieldType } from 'twenty-sdk';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  '41ff1a68-1286-48d6-b844-86d708231136';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '2862d405-e1ff-4986-b7c6-9cfc96dbf0d4';

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
