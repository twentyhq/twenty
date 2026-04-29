import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getAgentBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);

  return `import { defineAgent } from 'twenty-sdk/define';

export const ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_AGENT_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineAgent({
  universalIdentifier: ${kebabCaseName.toUpperCase().replace(/-/g, '_')}_AGENT_UNIVERSAL_IDENTIFIER,
  name: '${kebabCaseName}',
  label: '${name}',
  description: 'Add a description for your agent',
  prompt: 'Add the agent system prompt here',
});
`;
};
