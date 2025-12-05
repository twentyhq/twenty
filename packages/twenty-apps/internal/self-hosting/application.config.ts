import { type ApplicationConfig } from 'twenty-sdk/application';

const config: ApplicationConfig = {
  universalIdentifier: '94f7db30-59e5-4b09-a5fe-64cd3d4a65b0',
  displayName: 'Self Hosting',
  description: 'Used to manage billing and telemetry of self-hosted instances',
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d',
      description: 'Twenty API key for creating selfHostingUser records',
      isSecret: true,
    },
    TWENTY_API_URL: {
      universalIdentifier: 'b2c3d4e5-f6a7-4b8c-9d0e-1f2a3b4c5d6e',
      description: 'Twenty API URL (e.g., https://api.twenty.com)',
      isSecret: false,
    },
  },
};

export default config;
