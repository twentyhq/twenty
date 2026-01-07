import { v4 } from 'uuid';

export type RoleConfigTemplateOptions = {
  universalIdentifier?: string;
  label: string;
  description?: string;
  icon?: string;
  canReadAllObjectRecords?: boolean;
  canUpdateAllObjectRecords?: boolean;
};

export const getRoleConfigTemplate = ({
  universalIdentifier = v4(),
  label,
  description,
  icon = 'IconUser',
  canReadAllObjectRecords = true,
  canUpdateAllObjectRecords = false,
}: RoleConfigTemplateOptions): string => {
  const descriptionLine = description
    ? `\n  description: '${description}',`
    : '';

  return `import { defineRole } from 'twenty-sdk';

export default defineRole({
  universalIdentifier: '${universalIdentifier}',
  label: '${label}',${descriptionLine}
  icon: '${icon}',
  canReadAllObjectRecords: ${canReadAllObjectRecords},
  canUpdateAllObjectRecords: ${canUpdateAllObjectRecords},
});
`;
};
