import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '3e0bda4b-fb1d-42bd-bab3-03b66698e6ff',
  displayName: 'Claude',
  description:
    'Work with your Twenty workspace from Claude through the Twenty connector.',
  author: 'Anthropic',
  category: 'Productivity',
  logo: 'public/claude.png',
  websiteUrl: 'https://claude.ai',
  oAuthIdentity: {
    redirectUris: ['https://claude.ai/api/mcp/auth_callback'],
    clientIdMetadataDocumentHostnames: ['claude.ai'],
    connectUrl:
      'https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Twenty&connectorUrl={mcpServerUrl}',
  },
});
