import { defineObject, FieldType } from 'twenty-sdk';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  'b75cfe84-18ce-47da-812a-53e25ee094af';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '6ab9c690-06ce-455e-a2c9-8067a9747f96';

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
