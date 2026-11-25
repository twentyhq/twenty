import { defineMcpServer } from 'twenty-sdk/define';

import { HELP_CENTER_MCP_SERVER_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

export default defineMcpServer({
  universalIdentifier: HELP_CENTER_MCP_SERVER_UNIVERSAL_IDENTIFIER,
  name: 'help_center',
  label: 'Twenty Help Center',
  url: 'https://docs.twenty.com/mcp',
});
