import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getNavigationMenuItemBaseFile = ({
  name,
  universalIdentifier = v4(),
  type,
  viewUniversalIdentifier,
  targetObjectUniversalIdentifier,
}: {
  name: string;
  universalIdentifier?: string;
  type?: 'OBJECT' | 'VIEW' | 'LINK' | 'FOLDER';
  viewUniversalIdentifier?: string;
  targetObjectUniversalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  let typeAndConfig: string;

  if (type === 'OBJECT' && targetObjectUniversalIdentifier) {
    typeAndConfig = `  type: NavigationMenuItemType.OBJECT,
  targetObjectUniversalIdentifier: '${targetObjectUniversalIdentifier}',`;
  } else if (type === 'VIEW' && viewUniversalIdentifier) {
    typeAndConfig = `  type: NavigationMenuItemType.VIEW,
  viewUniversalIdentifier: '${viewUniversalIdentifier}',`;
  } else if (type === 'LINK') {
    typeAndConfig = `  type: NavigationMenuItemType.LINK,
  link: 'https://example.com',`;
  } else if (type === 'FOLDER') {
    typeAndConfig = `  type: NavigationMenuItemType.FOLDER,`;
  } else {
    typeAndConfig = `  type: NavigationMenuItemType.VIEW,
  // viewUniversalIdentifier: '...',`;
  }

  return `import { defineNavigationMenuItem, NavigationMenuItemType } from 'twenty-sdk/define';

export default defineNavigationMenuItem({
  universalIdentifier: '${universalIdentifier}',
  name: '${kebabCaseName}',
  icon: 'IconList',
  position: 0,
${typeAndConfig}
});
`;
};
