import { defineObject, FieldType } from 'twenty-sdk/define';

export const EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER =
  '47fd9bd9-392b-4d9f-9091-9a91b1edf519';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '2d9ff841-cf8e-44ec-ad8e-468455f7eebd';

export default defineObject({
  universalIdentifier: EXAMPLE_OBJECT_UNIVERSAL_IDENTIFIER,
  nameSingular: 'exampleItem',
  namePlural: 'exampleItems',
  labelSingular: 'Example item',
  labelPlural: 'Example items',
  description: 'A sample custom object',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier:
    NAME_FIELD_UNIVERSAL_IDENTIFIER,
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
