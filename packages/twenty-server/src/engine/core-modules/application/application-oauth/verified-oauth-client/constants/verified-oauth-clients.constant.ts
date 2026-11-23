import { MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-connect-listing-universal-identifiers.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

// A document URL is matched in full, not by host: vendors also serve user content from the same host.
export const VERIFIED_OAUTH_CLIENTS: VerifiedOAuthClient[] = [
  {
    name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
    universalIdentifier:
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    clientIdMetadataDocumentUrl: null,
  },
  {
    name: 'Claude',
    universalIdentifier:
      MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.CLAUDE,
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/mcp-oauth-client-metadata',
  },
  {
    name: 'Claude Code',
    universalIdentifier:
      MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.CLAUDE,
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/claude-code-client-metadata',
  },
  {
    name: 'ChatGPT',
    universalIdentifier:
      MARKETPLACE_CONNECT_LISTING_UNIVERSAL_IDENTIFIERS.CHATGPT,
    clientIdMetadataDocumentUrl: 'https://chatgpt.com/oauth/client.json',
  },
];
