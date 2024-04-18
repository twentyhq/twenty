import { ClientConfig } from '~/generated-metadata/graphql';

export const mockedClientConfig: ClientConfig = {
  signInPrefilled: true,
  signUpDisabled: false,
  debugMode: false,
  authProviders: {
    google: true,
    password: true,
    magicLink: false,
    __typename: 'AuthProviders',
  },
  telemetry: {
    enabled: false,
    anonymizationEnabled: true,
    __typename: 'Telemetry',
  },
  support: {
    supportDriver: 'front',
    supportFrontChatId: null,
    __typename: 'Support',
  },
  sentry: {
    dsn: 'MOCKED_DSN',
    release: 'MOCKED_RELEASE',
    environment: 'MOCKED_ENVIRONMENT',
    __typename: 'Sentry',
  },
  billing: {
    isBillingEnabled: true,
    billingUrl: '',
    billingFreeTrialDurationInDays: 10,
    __typename: 'Billing',
  },
  __typename: 'ClientConfig',
};
