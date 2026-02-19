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

export const getNavigationMenuItemForViewBaseFile = ({
  viewConstantName,
  viewImportPath,
}: {
  viewConstantName: string;
  viewImportPath: string;
}) => {
  const universalIdentifier = v4();

  return `import { defineNavigationMenuItem } from 'twenty-sdk';
import { ${viewConstantName} } from '${viewImportPath}';

export default defineNavigationMenuItem({
  universalIdentifier: '${universalIdentifier}',
  position: 0,
  viewUniversalIdentifier: ${viewConstantName},
});
`;
};
