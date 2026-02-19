import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

const toScreamingSnakeCase = (value: string) =>
  kebabCase(value).replace(/-/g, '_').toUpperCase();

export const getViewBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineView } from 'twenty-sdk';

export default defineView({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  objectUniversalIdentifier: 'fill-later',
  icon: 'IconList',
  position: 0,
  // fields: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     position: 0,
  //     isVisible: true,
  //   },
  // ],
  // filters: [
  //   {
  //     universalIdentifier: '...',
  //     fieldMetadataUniversalIdentifier: '...',
  //     operand: 'Contains',
  //     value: '',
  //   },
  // ],
});
`;
};

export const getViewForObjectBaseFile = ({
  objectConstantName,
  objectImportPath,
  labelPlural,
}: {
  objectConstantName: string;
  objectImportPath: string;
  labelPlural: string;
}) => {
  const universalIdentifier = v4();
  const constantName = `ALL_${toScreamingSnakeCase(labelPlural)}_VIEW_UNIVERSAL_IDENTIFIER`;

  const file = `import { defineView } from 'twenty-sdk';
import { ${objectConstantName} } from '${objectImportPath}';

export const ${constantName} =
  '${universalIdentifier}';

export default defineView({
  universalIdentifier: ${constantName},
  name: 'All ${labelPlural}',
  objectUniversalIdentifier: ${objectConstantName},
  icon: 'IconList',
  position: 0,
});
`;

  return { file, universalIdentifier, constantName };
};
