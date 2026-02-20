import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getNavigationMenuItemBaseFile = ({
  name,
  universalIdentifier = v4(),
  viewUniversalIdentifier,
}: {
  name: string;
  universalIdentifier?: string;
  viewUniversalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  const linkConfig = viewUniversalIdentifier
    ? `  viewUniversalIdentifier: '${viewUniversalIdentifier}',`
    : `  // Link to a view:
  // viewUniversalIdentifier: '...',
  // Or link to an object:
  // targetObjectUniversalIdentifier: '...',
  // Or link to an external URL:
  // link: 'https://example.com',`;

  return `import { defineNavigationMenuItem } from 'twenty-sdk';

export default defineNavigationMenuItem({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  icon: 'IconList',
  position: 0,
${linkConfig}
});
`;
};
