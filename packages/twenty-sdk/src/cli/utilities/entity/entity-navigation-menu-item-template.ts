import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getNavigationMenuItemBaseFile = ({
  name,
  universalIdentifier = v4(),
  viewUniversalIdentifier,
  targetObjectUniversalIdentifier,
}: {
  name: string;
  universalIdentifier?: string;
  viewUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  let linkConfig: string;

  if (targetObjectUniversalIdentifier) {
    linkConfig = `  targetObjectUniversalIdentifier: '${targetObjectUniversalIdentifier}',`;
  } else if (viewUniversalIdentifier) {
    linkConfig = `  viewUniversalIdentifier: '${viewUniversalIdentifier}',`;
  } else {
    linkConfig = `  // Link to an object:
  // targetObjectUniversalIdentifier: '...',
  // Or link to a view:
  // viewUniversalIdentifier: '...',
  // Or link to an external URL:
  // link: 'https://example.com',`;
  }

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
