import { ClientConfig } from '~/generated-metadata/graphql';
import { CaptchaDriverType } from '~/generated/graphql';

export const mockedClientConfig: ClientConfig = {
  signInPrefilled: true,
  signUpDisabled: false,
  chromeExtensionId: 'MOCKED_EXTENSION_ID',
  debugMode: false,
  authProviders: {
    google: true,
    password: true,
    magicLink: false,
    microsoft: false,
    __typename: 'AuthProviders',
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
  captcha: {
    provider: CaptchaDriverType.GoogleRecaptcha,
    siteKey: 'MOCKED_SITE_KEY',
    __typename: 'Captcha',
  },
  api: { mutationMaximumAffectedRecords: 100 },
};
