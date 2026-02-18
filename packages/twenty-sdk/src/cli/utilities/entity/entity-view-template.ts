import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

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
