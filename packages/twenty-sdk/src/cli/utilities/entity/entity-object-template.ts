import { v4 } from 'uuid';

export const getObjectBaseFile = ({
  data,
  universalIdentifier = v4(),
  nameFieldUniversalIdentifier = v4(),
}: {
  data: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  };
  name: string;
  universalIdentifier?: string;
  nameFieldUniversalIdentifier?: string;
}) => {
  return `import { defineObject, FieldType } from 'twenty-sdk';

export const NAME_FIELD_UNIVERSAL_IDENTIFIER =
  '${nameFieldUniversalIdentifier}';

export default defineObject({
  universalIdentifier: '${universalIdentifier}',
  nameSingular: '${data.nameSingular}',
  namePlural: '${data.namePlural}',
  labelSingular: '${data.labelSingular}',
  labelPlural: '${data.labelPlural}',
  icon: 'IconBox',
  labelIdentifierFieldMetadataUniversalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
  fields: [
    {
      universalIdentifier: NAME_FIELD_UNIVERSAL_IDENTIFIER,
      type: FieldType.TEXT,
      name: 'name',
      label: 'Name',
      description: 'Name of the ${data.nameSingular}',
      icon: 'IconAbc',
    },
  ],
});
`;
};
