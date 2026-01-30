import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = {
  universalIdentifier: '4ec0391d-18d5-411c-b2f3-266ddc1c3ef7',
  displayName: 'Hello World',
  description: 'A simple hello world app',
  icon: 'IconWorld',
  applicationVariables: {
    DEFAULT_RECIPIENT_NAME: {
      universalIdentifier: '19e94e59-d4fe-4251-8981-b96d0a9f74de',
      description: 'Default recipient name for postcards',
      value: 'Alex Karp',
      isSecret: false,
    },
  },
  functionRoleUniversalIdentifier: 'b648f87b-1d26-4961-b974-0908fd991061',
};

export default config;
