export const mockedClientConfig = {
  signInPrefilled: true,
  signUpDisabled: false,
  dataModelSettingsEnabled: true,
  developersSettingsEnabled: true,
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
  billing: {
    isBillingEnabled: true,
    billingUrl: '',
    billingFreeTrialDurationInDays: 10,
    __typename: 'Billing',
  },
  __typename: 'ClientConfig',
};
