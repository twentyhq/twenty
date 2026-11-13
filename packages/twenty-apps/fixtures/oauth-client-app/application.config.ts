import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: 'e1e2e3e4-e5e6-4000-8000-000000000101',
  displayName: 'Assistant',
  description: 'An external client members connect to Twenty',
  oAuthClient: {
    clientIdMetadataDocumentUrls: [
      'https://assistant.example.com/oauth/client.json',
    ],
    connectUrl:
      'https://assistant.example.com/connectors/new?url={mcpServerUrl}',
  },
});
