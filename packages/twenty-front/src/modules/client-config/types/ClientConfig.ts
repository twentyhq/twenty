import {
  type ApiConfig,
  type AuthProviders,
  type Billing,
  type Captcha,
  type ClientAiModelConfig,
  type PublicFeatureFlag,
  type Sentry,
  type Support,
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
  isImapSmtpCaldavEnabled: boolean;
  isEmailingDomainsEnabled: boolean;
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: boolean;
  support: Support;
  isTwoFactorAuthenticationEnabled: boolean;
};
