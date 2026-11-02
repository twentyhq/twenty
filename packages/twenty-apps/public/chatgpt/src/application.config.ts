import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '6e58bb83-49dc-4d4d-ae82-662890eda505',
  displayName: 'ChatGPT',
  description:
    'Work with your Twenty workspace from ChatGPT through the official Twenty app.',
  author: 'OpenAI',
  category: 'Productivity',
  logo: 'public/chatgpt.svg',
  websiteUrl: 'https://chatgpt.com',
  oAuthIdentity: {
    redirectUris: [
      'https://chatgpt.com/connector_platform_oauth_redirect',
      'https://chatgpt.com/connector/oauth/*',
    ],
    clientIdMetadataDocumentHostnames: ['chatgpt.com'],
    connectUrl:
      'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c',
  },
});
