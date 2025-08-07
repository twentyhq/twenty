import {
  ApiConfig,
  AuthProviders,
  Billing,
  Captcha,
  ClientAiModelConfig,
  PublicFeatureFlag,
  Sentry,
  Support,
} from '~/generated-metadata/graphql';

export type ClientConfig = {
  appVersion?: string;
  aiModels: Array<ClientAiModelConfig>;
  analyticsEnabled: boolean;
  api: ApiConfig;
  authProviders: AuthProviders;
  billing: Billing;
  calendarBookingPageId?: string;
  canManageFeatureFlags: boolean;
  captcha: Captcha;
  chromeExtensionId?: string;
  debugMode: boolean;
  defaultSubdomain?: string;
  frontDomain: string;
  isAttachmentPreviewEnabled: boolean;
  isConfigVariablesInDbEnabled: boolean;
  isEmailVerificationRequired: boolean;
  isGoogleCalendarEnabled: boolean;
  isGoogleMessagingEnabled: boolean;
  isMicrosoftCalendarEnabled: boolean;
  isMicrosoftMessagingEnabled: boolean;
  isMultiWorkspaceEnabled: boolean;
  isWorkspaceCreationLimitedToAdmins: boolean;
  isImapSmtpCaldavEnabled: boolean;
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: boolean;
  support: Support;
  isTwoFactorAuthenticationEnabled: boolean;
};
