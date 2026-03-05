import { v4 } from 'uuid';

export const getObjectBaseFile = ({
  data,
  universalIdentifier = v4(),
}: {
  data: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  };
  name: string;
  universalIdentifier?: string;
}) => {
  return `import { defineObject } from 'twenty-sdk';

export default defineObject({
  universalIdentifier: '${universalIdentifier}',
  nameSingular: '${data.nameSingular}',
  namePlural: '${data.namePlural}',
  labelSingular: '${data.labelSingular}',
  labelPlural: '${data.labelPlural}',
  icon: 'IconBox',
  fields: [
    // Add your fields here using defineField helper
    // Example:
    // {
    //   universalIdentifier: '...',
    //   type: FieldMetadataType.TEXT,
    //   name: 'description',
    //   label: 'Description',
    // },
  ],
});
`;
};
