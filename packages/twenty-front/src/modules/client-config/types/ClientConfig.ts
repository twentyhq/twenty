import {
  type ApiConfig,
  type AuthProviders,
  type Billing,
  type Captcha,
  type ClientAiModelConfig,
  type ClientConfigMaintenanceMode,
  type PublicFeatureFlag,
  type Sentry,
  type Support,
} from '~/generated-metadata/graphql';
import { type OnboardingConfig } from '@/client-config/types/OnboardingConfig';

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
  defaultSubdomain?: string;
  frontDomain: string;
  publicFunctionDomain?: string | null;
  isAttachmentPreviewEnabled: boolean;
  isConfigVariablesInDbEnabled: boolean;
  isEmailVerificationRequired: boolean;
  isGoogleCalendarEnabled: boolean;
  isGoogleMessagingEnabled: boolean;
  isMicrosoftCalendarEnabled: boolean;
  isMicrosoftMessagingEnabled: boolean;
  isMultiWorkspaceEnabled: boolean;
  isImapSmtpCaldavEnabled: boolean;
  isEmailingDomainInDemoMode: boolean;
  isCloudflareIntegrationEnabled: boolean;
  isClickHouseConfigured: boolean;
  isWorkspaceSchemaDDLLocked: boolean;
  onboarding: OnboardingConfig;
  publicFeatureFlags: Array<PublicFeatureFlag>;
  sentry: Sentry;
  signInPrefilled: boolean;
  support: Support;
  isTwoFactorAuthenticationEnabled: boolean;
  allowRequestsToTwentyIcons: boolean;
  maintenance?: ClientConfigMaintenanceMode;
};
