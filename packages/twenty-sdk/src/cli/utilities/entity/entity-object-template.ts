import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

const toScreamingSnakeCase = (value: string) =>
  kebabCase(value).replace(/-/g, '_').toUpperCase();

export const getObjectBaseFile = ({
  data,
}: {
  data: {
    nameSingular: string;
    namePlural: string;
    labelSingular: string;
    labelPlural: string;
  };
  name: string;
}) => {
  const universalIdentifier = v4();
  const constantName = `${toScreamingSnakeCase(data.nameSingular)}_UNIVERSAL_IDENTIFIER`;

  const file = `import { defineObject } from 'twenty-sdk';

export const ${constantName} =
  '${universalIdentifier}';

export default defineObject({
  universalIdentifier: ${constantName},
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

  return { file, universalIdentifier, constantName };
};
