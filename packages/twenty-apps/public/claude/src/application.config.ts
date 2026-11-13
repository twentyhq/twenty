import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '20202020-b759-4b27-9593-4d075aea79ed',
  displayName: 'Claude',
  description:
    'Search, create and update your Twenty records from a Claude conversation.',
  author: 'Anthropic',
  category: 'Productivity',
  logo: 'public/logo.webp',
  galleryImages: ['public/cover.webp'],
  websiteUrl: 'https://claude.ai',
  oAuthClient: {
    clientIdMetadataDocumentUrls: [
      'https://claude.ai/oauth/mcp-oauth-client-metadata',
      'https://claude.ai/oauth/claude-code-client-metadata',
    ],
    connectUrl:
      'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Twenty&connectorUrl={mcpServerUrl}',
  },
});
