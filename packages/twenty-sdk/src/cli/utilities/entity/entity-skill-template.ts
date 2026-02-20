import kebabCase from 'lodash.kebabcase';
import { v4 } from 'uuid';

export const getSkillBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineSkill } from 'twenty-sdk';

export const ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_SKILL_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineSkill({
  universalIdentifier: ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_SKILL_UNIVERSAL_IDENTIFIER,
  name: '${kebabCaseName}',
  label: '${name}',
  description: 'Add a description for your skill',
  content: 'Add the skill content here',
});
`;
};
