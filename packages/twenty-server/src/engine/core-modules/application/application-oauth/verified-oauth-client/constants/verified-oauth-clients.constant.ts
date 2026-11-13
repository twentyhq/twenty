import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/marketplace-built-in-application-universal-identifiers.constant';
import { type VerifiedOAuthClient } from 'src/engine/core-modules/application/application-oauth/verified-oauth-client/types/verified-oauth-client.type';
import { TWENTY_CLI_APPLICATION_REGISTRATION } from 'src/engine/workspace-manager/twenty-standard-application/constants/twenty-cli-application-registration.constant';

// A document URL is matched in full, not by host: vendors also serve user content from the same host.
export const VERIFIED_OAUTH_CLIENTS: VerifiedOAuthClient[] = [
  {
    name: TWENTY_CLI_APPLICATION_REGISTRATION.name,
    registrationUniversalIdentifier:
      TWENTY_CLI_APPLICATION_REGISTRATION.universalIdentifier,
    marketplaceAppUniversalIdentifier:
      MARKETPLACE_BUILT_IN_APPLICATION_UNIVERSAL_IDENTIFIERS.TWENTY_CLI,
  },
  {
    name: 'Claude',
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/mcp-oauth-client-metadata',
    marketplaceAppUniversalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CLAUDE,
  },
  {
    name: 'Claude Code',
    clientIdMetadataDocumentUrl:
      'https://claude.ai/oauth/claude-code-client-metadata',
    marketplaceAppUniversalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CLAUDE,
  },
  {
    name: 'ChatGPT',
    clientIdMetadataDocumentUrl: 'https://chatgpt.com/oauth/client.json',
    marketplaceAppUniversalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CHATGPT,
  },
];
