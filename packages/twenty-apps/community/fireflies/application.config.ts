import { type ApplicationConfig } from 'twenty-sdk';

const config: ApplicationConfig = {
  universalIdentifier: 'a4df0c0f-c65e-44e5-8436-24814182d4ac',
  displayName: 'Fireflies',
  description: 'Sync Fireflies meeting summaries, sentiment, and action items into Twenty.',
  icon: 'IconMicrophone',
  applicationVariables: {
    FIREFLIES_WEBHOOK_SECRET: {
      universalIdentifier: 'f51f7646-be9f-4ba9-9b75-160dd288cd0c',
      description: 'Secret key for verifying Fireflies webhook signatures',
      //isSecret: true,
      value: '',
    },
    FIREFLIES_API_KEY: {
      universalIdentifier: 'faa41f07-b28e-4500-b1c0-ce4b3d27924c',
      description: 'Fireflies GraphQL API key used to fetch meeting summaries',
      //isSecret: true,
      value: '',
    },
    FIREFLIES_PLAN: {
      universalIdentifier: '57dbb73c-aac5-4247-9fcc-a070bb669f16',
      description: 'Fireflies plan: free, pro, business, enterprise',
      value: 'free',
    },
    TWENTY_API_KEY: {
      universalIdentifier: '02756551-5bf7-4fb2-8e08-1f622008d305',
      description: 'Twenty API key used when running scripts locally',
      //isSecret: true,
      value: '',
    },
    SERVER_URL: {
      universalIdentifier: '9b3a5e8e-5973-4e6b-a059-2966075652aa',
      description: 'Base URL for the Twenty workspace (default: http://localhost:3000)',
      value: 'http://localhost:3000',
    },
    AUTO_CREATE_CONTACTS: {
      universalIdentifier: 'c4fa946e-e06b-4d54-afb6-288b0ac75bdf',
      description: 'Whether to auto-create contacts for unknown participants',
      value: 'true',
    },
    LOG_LEVEL: {
      universalIdentifier: '2b019cf1-d198-48dd-943e-110571aa541e',
      description: 'Log level: silent, error, warn, info, debug (default: error)',
      value: 'error',
    },
    CAPTURE_LOGS: {
      universalIdentifier: 'adbcc267-309d-49b2-af71-76f1299d863e',
      description: 'Capture logs in webhook response for debugging (true/false)',
      value: 'true',
    },
    FIREFLIES_SUMMARY_STRATEGY: {
      universalIdentifier: '562b43d9-cd47-4ec1-ae16-5cc7ebc9729b',
      description: 'Summary fetch strategy: immediate_only, immediate_with_retry, delayed_polling, or basic_only',
      value: 'immediate_with_retry',
    },
    FIREFLIES_RETRY_ATTEMPTS: {
      universalIdentifier: '670ca203-01ce-4ae8-8294-eb38b29434f2',
      description: 'Number of retry attempts when fetching summaries',
      value: '3',
    },
    FIREFLIES_RETRY_DELAY: {
      universalIdentifier: '2e8ccb82-9390-47ba-b628-ca2726931bce',
      description: 'Delay in milliseconds between retry attempts',
      value: '5000',
    },
    FIREFLIES_POLL_INTERVAL: {
      universalIdentifier: '904538f7-7bec-4ee6-9bac-5d43c619b667',
      description: 'Polling interval (ms) when using delayed polling strategy',
      value: '30000',
    },
    FIREFLIES_MAX_POLLS: {
      universalIdentifier: '84d54c97-5572-4c01-9039-764ab3aa87b8',
      description: 'Maximum number of polling attempts when waiting for summaries',
      value: '10',
    },
  },
};

export default config;

