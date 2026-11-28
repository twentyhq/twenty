import { defineMcpServer } from 'twenty-sdk/define';

import {
  GITHUB_MCP_SERVER_UNIVERSAL_IDENTIFIER,
  GITHUB_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
} from 'src/constants/universal-identifiers';

export default defineMcpServer({
  universalIdentifier: GITHUB_MCP_SERVER_UNIVERSAL_IDENTIFIER,
  name: 'github',
  label: 'GitHub',
  url: 'https://api.githubcopilot.com/mcp/',
  connectionProviderUniversalIdentifier:
    GITHUB_USER_CONNECTION_PROVIDER_UNIVERSAL_IDENTIFIER,
});
