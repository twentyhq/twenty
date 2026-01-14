import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = {
  universalIdentifier: '718ed9ab-53fc-49c8-8deb-0cff78ecf0d2',
  displayName: 'Last email interaction',
  description:
    'Updates Last interaction and Interaction status fields based on last received email',
  icon: "IconMailFast",
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'aae3f523-4c1f-4805-b3ee-afeb676c381e',
      isSecret: true,
      description: 'Required to send requests to Twenty',
    },
    TWENTY_API_URL: {
      universalIdentifier: '6d19bb04-45bb-46aa-a4e5-4a2682c7b19d',
      isSecret: false,
      description: 'Optional, defaults to cloud API URL',
    },
  },
};

export default config;
