import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Hello World',
  description: 'A simple hello world app',
  icon: 'IconWorld',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'dedc53eb-9c12-4fe2-ba86-4a2add19d305',
      description: 'Twenty API Key',
      isSecret: true,
    },
    TWENTY_BASE_URL: {
      universalIdentifier: '5a9eb79b-9dab-48bd-95a7-c4ae700673aa',
      description: 'Twenty API base url',
      value: 'http://localhost:3000',
      isSecret: false,
    },
  },
};

export default config;
