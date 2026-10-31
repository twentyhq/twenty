import { WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

import { WellKnownOAuthClient } from 'src/engine/core-modules/application/well-known-oauth-client/enums/well-known-oauth-client.enum';
import { type WellKnownOAuthClientDefinition } from 'src/engine/core-modules/application/well-known-oauth-client/types/well-known-oauth-client-definition.type';

// Callbacks and metadata document hosts follow each vendor's connector docs:
// https://claude.com/docs/connectors/building/authentication
// https://developers.openai.com/apps-sdk/build/auth
export const WELL_KNOWN_OAUTH_CLIENTS: WellKnownOAuthClientDefinition[] = [
  {
    client: WellKnownOAuthClient.CHATGPT,
    universalIdentifier: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CHATGPT,
    name: 'ChatGPT',
    description:
      'Work with your Twenty workspace from ChatGPT through the official Twenty app.',
    aboutDescription:
      'Connect ChatGPT to Twenty to search, create and update your records from a conversation. Each member connects their own ChatGPT account and ChatGPT acts with that member’s permissions. A member can disconnect at any time from Settings > Apps preferences.',
    author: 'OpenAI',
    category: 'Productivity',
    websiteUrl: 'https://chatgpt.com',
    logo: 'chatgpt.svg',
    allowedRedirectUris: [
      'https://chatgpt.com/connector_platform_oauth_redirect',
      /^https:\/\/chatgpt\.com\/connector\/oauth\/[A-Za-z0-9_-]+$/,
    ],
    clientIdMetadataDocumentHostnames: ['chatgpt.com'],
  },
  {
    client: WellKnownOAuthClient.CLAUDE,
    universalIdentifier: WELL_KNOWN_OAUTH_CLIENT_UNIVERSAL_IDENTIFIERS.CLAUDE,
    name: 'Claude',
    description:
      'Work with your Twenty workspace from Claude through the Twenty connector.',
    aboutDescription:
      'Connect Claude to Twenty to search, create and update your records from a conversation. Each member connects their own Claude account and Claude acts with that member’s permissions. A member can disconnect at any time from Settings > Apps preferences.',
    author: 'Anthropic',
    category: 'Productivity',
    websiteUrl: 'https://claude.ai',
    logo: 'claude.png',
    allowedRedirectUris: ['https://claude.ai/api/mcp/auth_callback'],
    clientIdMetadataDocumentHostnames: ['claude.ai'],
  },
];
