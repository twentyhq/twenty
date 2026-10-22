import { kebabCase } from '@/cli/utilities/string/kebab-case';
import { v4 } from 'uuid';

export const getMcpServerBaseFile = ({
  name,
  universalIdentifier = v4(),
}: {
  name: string;
  universalIdentifier?: string;
}) => {
  const kebabCaseName = kebabCase(name);
  const snakeCaseName = kebabCaseName.replace(/-/g, '_');
  const upperKey = snakeCaseName.toUpperCase();
  const escapedLabel = name.replace(/\\/g, '\\\\').replace(/'/g, "\\'");

  return `import { defineMcpServer } from 'twenty-sdk/define';

export const ${upperKey}_MCP_SERVER_UNIVERSAL_IDENTIFIER =
  '${universalIdentifier}';

export default defineMcpServer({
  universalIdentifier: ${upperKey}_MCP_SERVER_UNIVERSAL_IDENTIFIER,
  // Prefixes every tool of this server in the AI chat: app_${snakeCaseName}_<tool>
  name: '${snakeCaseName}',
  label: '${escapedLabel}',
  // Streamable HTTP endpoint of the MCP server. Its tools/list is cached on install.
  url: 'https://example.com/mcp',
});
`;
};
