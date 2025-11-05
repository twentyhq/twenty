import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '627280a0-cb5b-40d3-a2e3-3e34b92926c8',
  displayName: 'Browser Extension',
  description: '',
  applicationVariables: {
    TWENTY_API_URL: {
      universalIdentifier: '6cf6a57a-9708-4995-b6a5-65222ee1baf1',
      isSecret: false,
      value: '',
      description: 'Twenty API URL',
    },
    TWENTY_API_KEY: {
      universalIdentifier: '05d12575-e96e-4e45-b019-80dcdb67dc80',
      isSecret: true,
      value: '',
      description: 'Twenty API Key',
    },
  },
};

export default config;
