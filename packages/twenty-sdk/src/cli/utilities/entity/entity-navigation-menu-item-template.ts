import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getNavigationMenuItemBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineNavigationMenuItem } from 'twenty-sdk';

export default defineNavigationMenuItem({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  icon: 'IconList',
  position: 0,
  // Link to a view:
  // viewUniversalIdentifier: '...',
  // Or link to an object:
  // targetObjectUniversalIdentifier: '...',
  // Or link to an external URL:
  // link: 'https://example.com',
});
`;
};
