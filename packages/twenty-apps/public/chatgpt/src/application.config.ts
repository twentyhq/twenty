import { defineApplication } from 'twenty-sdk/define';

export default defineApplication({
  universalIdentifier: '20202020-2cef-4d6c-9c88-05b40177ce9e',
  displayName: 'ChatGPT',
  description:
    'Search, create and update your Twenty records from a ChatGPT conversation.',
  author: 'OpenAI',
  category: 'Productivity',
  logo: 'public/logo.webp',
  galleryImages: ['public/cover.webp'],
  websiteUrl: 'https://chatgpt.com',
  oAuthClient: {
    clientIdMetadataDocumentUrls: [
      'https://chatgpt.com/oauth/client.json',
    ],
    connectUrl:
      'https://chatgpt.com/apps/twenty/asdk_app_6a0ac8d7e28c8191a58ea65bb0ca3d5c',
  },
});
