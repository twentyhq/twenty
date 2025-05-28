import { CaptchaDriverType, ClientConfig } from '~/generated/graphql';

export const mockedClientConfig: ClientConfig = {
  signInPrefilled: true,
  isMultiWorkspaceEnabled: false,
  isEmailVerificationRequired: false,
  authProviders: {
    google: true,
    magicLink: false,
    password: true,
    microsoft: false,
    sso: [],
  },
  frontDomain: 'localhost',
  defaultSubdomain: 'app',
  chromeExtensionId: 'MOCKED_EXTENSION_ID',
  debugMode: false,
  analyticsEnabled: true,
  support: {
    supportDriver: 'front',
    supportFrontChatId: null,
  },
  sentry: {
    dsn: 'MOCKED_DSN',
    release: 'MOCKED_RELEASE',
    environment: 'MOCKED_ENVIRONMENT',
  },
  billing: {
    isBillingEnabled: true,
    billingUrl: '',
    trialPeriods: [
      {
        duration: 30,
        isCreditCardRequired: true,
      },
      {
        duration: 7,
        isCreditCardRequired: false,
      },
    ],
  },
  captcha: {
    provider: CaptchaDriverType.GoogleRecaptcha,
    siteKey: 'MOCKED_SITE_KEY',
  },
  api: { mutationMaximumAffectedRecords: 100 },
  canManageFeatureFlags: true,
  publicFeatureFlags: [],
  isMicrosoftMessagingEnabled: true,
  isMicrosoftCalendarEnabled: true,
  isGoogleMessagingEnabled: true,
  isGoogleCalendarEnabled: true,
  isAttachmentPreviewEnabled: true,
  isConfigVariablesInDbEnabled: false,
};
