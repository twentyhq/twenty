import { MCP_PROTOCOL_VERSION } from 'src/engine/api/mcp/constants/mcp-protocol-version.const';
import {
  MCP_SERVER_CARD_DESCRIPTION,
  MCP_SERVER_CARD_NAME,
  MCP_SERVER_CARD_SCHEMA,
  MCP_SERVER_CARD_TITLE,
  TWENTY_REPOSITORY_URL,
  TWENTY_WEBSITE_URL,
} from 'src/engine/core-modules/well-known/constants/well-known.constants';
import { type McpServerCard } from 'src/engine/core-modules/well-known/types/mcp-server-card.type';

type BuildMcpServerCardArgs = {
  baseUrl: string;
  version: string;
};

// The Authorization header is optional: sending `Bearer <api-key>` uses static
// API-key auth, while omitting it triggers OAuth 2.1, auto-discovered from this
// same host's oauth-protected-resource / oauth-authorization-server metadata.
export const buildMcpServerCard = ({
  baseUrl,
  version,
}: BuildMcpServerCardArgs): McpServerCard => ({
  $schema: MCP_SERVER_CARD_SCHEMA,
  name: MCP_SERVER_CARD_NAME,
  version,
  title: MCP_SERVER_CARD_TITLE,
  description: MCP_SERVER_CARD_DESCRIPTION,
  websiteUrl: TWENTY_WEBSITE_URL,
  repository: {
    url: TWENTY_REPOSITORY_URL,
    source: 'github',
  },
  remotes: [
    {
      type: 'streamable-http',
      url: `${baseUrl}/mcp`,
      supportedProtocolVersions: [MCP_PROTOCOL_VERSION],
      headers: [
        {
          name: 'Authorization',
          description:
            "Optional. Bearer <api-key> for static API-key auth. Omit to use OAuth 2.1, auto-discovered from this host's /.well-known/oauth-protected-resource and /.well-known/oauth-authorization-server.",
          isRequired: false,
          isSecret: true,
        },
      ],
    },
  ],
});
