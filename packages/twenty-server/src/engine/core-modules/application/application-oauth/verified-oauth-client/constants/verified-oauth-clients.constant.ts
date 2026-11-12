import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

// A document URL is matched in full, not by host: vendors also serve user content from the same host.
// logoPath is served by the front end, from its public folder.
export const VERIFIED_OAUTH_CLIENTS: VerifiedOAuthClient[] = [
  {
    name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
    registrationUniversalIdentifier:
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    logoPath: '/images/oauth-clients/twenty-cli.svg',
  },
  {
    name: 'Claude',
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/mcp-oauth-client-metadata',
  },
  {
    name: 'Claude Code',
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/claude-code-client-metadata',
  },
  {
    name: 'ChatGPT',
    clientIdMetadataDocumentUrl: 'https://chatgpt.com/oauth/client.json',
  },
];
