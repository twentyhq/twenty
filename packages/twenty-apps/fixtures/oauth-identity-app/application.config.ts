import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000101',
  displayName: 'Assistant',
  description: 'An external client members connect to Twenty',
  oAuthIdentity: {
    redirectUris: ['https://assistant.example.com/oauth/*'],
    clientIdMetadataDocumentHostnames: ['assistant.example.com'],
    connectUrl:
      'https://assistant.example.com/connectors/new?url={mcpServerUrl}',
  },
});
