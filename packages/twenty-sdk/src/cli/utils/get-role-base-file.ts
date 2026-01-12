import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getRoleBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineRole } from 'twenty-sdk';

export const ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_ROLE_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineRole({
  universalIdentifier: ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_ROLE_UNIVERSAL_IDENTIFIER,
  label: '${name}',
  description: 'Add a description for your role',
  canReadAllObjectRecords: true,
  canUpdateAllObjectRecords: true,
  canSoftDeleteAllObjectRecords: true,
  canDestroyAllObjectRecords: false,
});
`;
};
