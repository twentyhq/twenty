import { defineMcpServer } from 'twenty-sdk/define';

export const HELP_CENTER_MCP_SERVER_UNIVERSAL_IDENTIFIER =
  '7c1f0a6e-2d3b-4c5d-9e8f-0a1b2c3d4e5f';

export default defineMcpServer({
  universalIdentifier: HELP_CENTER_MCP_SERVER_UNIVERSAL_IDENTIFIER,
  name: 'help_center',
  label: 'Help center',
  url: 'https://docs.twenty.com/mcp',
});
