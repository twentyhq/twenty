import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = {
  universalIdentifier: '0ed2bcb8-64ab-4ca1-b875-eeabf41b5f95',
  displayName: 'Stripe synchronizer',
  description: 'Plugin synchronizing data from Stripe to Twenty',
  icon: "IconMoneyBag",
  applicationVariables: {
    TWENTY_API_KEY: {
      universalIdentifier: 'b0d9569b-da3e-4dad-b7b1-36c96f0598b9',
      isSecret: true,
      description: 'Required to send requests to Twenty',
    },
    TWENTY_API_URL: {
      universalIdentifier: 'fa50e016-e045-497a-9cdf-0949e7ef9f7a',
      isSecret: false,
      description: 'Optional, defaults to cloud API URL',
    },
    STRIPE_API_KEY: {
      universalIdentifier: '807d67d6-f720-49c4-a93e-ef16cf4fe919',
      isSecret: true,
      description: 'Required to send request to Stripe',
    },
  },
};

export default config;
