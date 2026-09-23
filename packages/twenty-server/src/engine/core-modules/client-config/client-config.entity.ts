import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { type AiModelTier, type AiSdkPackage } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { BillingTrialPeriodDTO } from 'src/engine/core-modules/billing/dtos/billing-trial-period.dto';
import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { AuthProvidersDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data.dto';
import { type AiModelKind } from 'src/engine/metadata-modules/ai/ai-models/constants/ai-model-kinds.const';
import { AiModelTier as AiModelTierEnum } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-tier.enum';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

registerEnumType(FeatureFlagKey, {
  name: 'FeatureFlagKey',
});

registerEnumType(ModelFamily, {
  name: 'ModelFamily',
});

@ObjectType()
export class NativeModelCapabilities {
  @Field(() => Boolean, { nullable: true })
  webSearch?: boolean;

  @Field(() => Boolean, { nullable: true })
  twitterSearch?: boolean;
}

@ObjectType()
export class ClientAiModelConfig {
  @Field(() => String)
  // Composite model id (`provider/modelName`) for this workspace; matches registry and admin APIs.
  modelId: ModelId;

  @Field(() => String)
  label: string;

  @Field(() => ModelFamily, { nullable: true })
  modelFamily?: ModelFamily;

  @Field({ nullable: true })
  modelFamilyLabel?: string;

  @Field(() => String, { nullable: true })
  sdkPackage: AiSdkPackage | null;

  @Field(() => Number, { nullable: true })
  inputCostPerMillionTokens?: number;

  @Field(() => Number, { nullable: true })
  outputCostPerMillionTokens?: number;

  @Field(() => NativeModelCapabilities, { nullable: true })
  nativeCapabilities?: NativeModelCapabilities;

  @Field(() => Boolean, { nullable: true })
  isDeprecated?: boolean;

  @Field(() => String, { nullable: true })
  providerName?: string;

  @Field(() => String, { nullable: true })
  providerLabel?: string;

  @Field(() => Number, { nullable: true })
  contextWindowTokens?: number;

  @Field(() => Number, { nullable: true })
  maxOutputTokens?: number;

  @Field(() => String, { nullable: true })
  dataResidency?: string;

  @Field(() => Number, { nullable: true })
  intelligenceIndex?: number;

  @Field(() => Number, { nullable: true })
  outputTokensPerSecond?: number;

  @Field(() => Number, { nullable: true })
  costPerTask?: number;

  // Reasoning levels a pin may name as `modelId@effort`; empty for a model
  // that takes none, unset on a variant that already names its own.
  @Field(() => [String], { nullable: true })
  efforts?: string[];

  @Field(() => String, { nullable: true })
  effort?: string;

  // A pinned effort without a reading of its own shows the base model's
  // figures until the benchmark sync measures it.
  @Field(() => Boolean, { nullable: true })
  isBenchmarkInherited?: boolean;
}

@ObjectType()
// Evaluation models are kept in their own list rather than mixed into
// aiModels: every existing picker reads that list, and a model that cannot
// answer a chat turn must not be offered by one that forgot to filter.
export class ClientAiEvaluationModelConfig {
  @Field(() => String)
  modelId: string;

  @Field(() => String)
  label: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => String, { nullable: true })
  providerLabel?: string;

  // False when the catalog declares the model but the instance holds no key
  // for its provider. The picker still shows it, so an operator can see what
  // configuring the provider would buy.
  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => [String])
  supportedQuestionTypes: string[];

  @Field(() => Number, { nullable: true })
  maxCriteriaPerQuestion?: number;

  @Field(() => Number, { nullable: true })
  maxScoreLevels?: number;

  @Field(() => Number, { nullable: true })
  medianLatencyMs?: number;

  @Field(() => Number, { nullable: true })
  inputCostPerMillionTokens?: number;

  @Field(() => Number, { nullable: true })
  outputCostPerMillionTokens?: number;

  @Field(() => Boolean, { nullable: true })
  isDeprecated?: boolean;
}

@ObjectType()
export class ClientAiModelTierConfig {
  @Field(() => AiModelTierEnum)
  tier: AiModelTier;

  // The model this instance resolves the tier to when a workspace has no pin.
  @Field(() => String)
  modelId: ModelId;
}

@ObjectType()
export class AdminAiModelConfig {
  @Field(() => String)
  // Composite model id (`provider/modelName`) used for toggles, defaults, and registry lookups.
  modelId: string;

  @Field(() => String)
  label: string;

  // What the model is for. An evaluation model answers typed questions and
  // cannot be chatted with, so the table has to say which is which rather than
  // list them side by side as interchangeable.
  @Field(() => String)
  kind: AiModelKind;

  @Field(() => ModelFamily, { nullable: true })
  modelFamily?: ModelFamily;

  @Field({ nullable: true })
  modelFamilyLabel?: string;

  @Field(() => String, { nullable: true })
  sdkPackage: AiSdkPackage | null;

  @Field(() => Boolean)
  isAvailable: boolean;

  @Field(() => Boolean)
  isAdminEnabled: boolean;

  @Field(() => Boolean, { nullable: true })
  isDeprecated?: boolean;

  @Field(() => Number, { nullable: true })
  contextWindowTokens?: number;

  @Field(() => Number, { nullable: true })
  maxOutputTokens?: number;

  @Field(() => Number, { nullable: true })
  inputCostPerMillionTokens?: number;

  @Field(() => Number, { nullable: true })
  outputCostPerMillionTokens?: number;

  @Field(() => String, { nullable: true })
  providerName?: string;

  @Field(() => String, { nullable: true })
  providerLabel?: string;

  @Field(() => String, { nullable: true })
  // Bare SDK model name from the provider definition (`AiProviderModelConfig.name`), not the composite `modelId`.
  name?: string;

  @Field(() => String, { nullable: true })
  dataResidency?: string;

  @Field(() => [String], { nullable: true })
  efforts?: string[];
}

@ObjectType()
export class AdminAiModelTierDefault {
  @Field(() => AiModelTierEnum)
  tier: AiModelTier;

  // The model the tier resolves to on this instance; unset when no model is
  // available.
  @Field(() => String, { nullable: true })
  modelId?: string;
}

@ObjectType('AdminAiModels')
export class AdminAiModelsDTO {
  @Field(() => [AdminAiModelConfig])
  models: AdminAiModelConfig[];

  @Field(() => [AdminAiModelTierDefault])
  defaultModelByTier: AdminAiModelTierDefault[];
}

@ObjectType()
export class Billing {
  @Field(() => Boolean)
  isBillingEnabled: boolean;

  @Field(() => String, { nullable: true })
  billingUrl?: string;

  @Field(() => String, { nullable: true })
  stripePublishableKey?: string;

  @Field(() => [BillingTrialPeriodDTO])
  trialPeriods: BillingTrialPeriodDTO[];
}

@ObjectType()
export class Support {
  @Field(() => SupportDriver)
  supportDriver: SupportDriver;

  @Field(() => String, { nullable: true })
  supportFrontChatId?: string;
}

@ObjectType()
export class Sentry {
  @Field(() => String, { nullable: true })
  environment?: string;

  @Field(() => String, { nullable: true })
  release?: string;

  @Field(() => String, { nullable: true })
  dsn?: string;

  @Field(() => Number, { nullable: true })
  tracesSampleRate?: number;
}

@ObjectType()
export class Captcha {
  @Field(() => CaptchaDriverType, { nullable: true })
  provider: CaptchaDriverType | undefined;

  @Field(() => String, { nullable: true })
  siteKey: string | undefined;
}

@ObjectType()
export class ApiConfig {
  @Field(() => Number, { nullable: false })
  mutationMaximumAffectedRecords: number;
}

export class OnboardingConfig {
  importContactsCreditsReward: number;

  inviteTeamCreditsRewardPerUser: number;

  installAppsCreditsRewardPerApp: number;

  inviteTeamMaxInvites: number;
}

@ObjectType()
export class PublicFeatureFlagMetadata {
  @Field(() => String)
  label: string;

  @Field(() => String)
  description: string;

  @Field(() => String)
  icon: string;

  @Field(() => String, { nullable: true })
  imagePath?: string;
}

@ObjectType()
export class PublicFeatureFlag {
  @Field(() => FeatureFlagKey)
  key: FeatureFlagKey;

  @Field(() => PublicFeatureFlagMetadata)
  metadata: PublicFeatureFlagMetadata;
}

@ObjectType()
export class ClientConfigMaintenanceMode {
  @Field(() => GraphQLISODateTime)
  startAt: Date;

  @Field(() => GraphQLISODateTime)
  endAt: Date;

  @Field(() => String, { nullable: true })
  link?: string;
}

@ObjectType()
export class ClientConfig {
  @Field(() => String, { nullable: true })
  appVersion?: string;

  @Field(() => AuthProvidersDTO, { nullable: false })
  authProviders: AuthProvidersDTO;

  @Field(() => Billing, { nullable: false })
  billing: Billing;

  @Field(() => [ClientAiModelConfig])
  aiModels: ClientAiModelConfig[];

  @Field(() => [ClientAiEvaluationModelConfig])
  aiEvaluationModels: ClientAiEvaluationModelConfig[];

  @Field(() => [ClientAiModelTierConfig])
  aiModelTiers: ClientAiModelTierConfig[];

  @Field(() => Boolean)
  signInPrefilled: boolean;

  @Field(() => Boolean)
  isMultiWorkspaceEnabled: boolean;

  @Field(() => Boolean)
  isEmailVerificationRequired: boolean;

  @Field(() => String, { nullable: true })
  defaultSubdomain: string;

  @Field(() => String)
  frontDomain: string;

  @Field(() => String, { nullable: true })
  publicFunctionDomain: string | null;

  @Field(() => Boolean)
  analyticsEnabled: boolean;

  @Field(() => Support)
  support: Support;

  @Field(() => Boolean)
  isAttachmentPreviewEnabled: boolean;

  @Field(() => Sentry)
  sentry: Sentry;

  @Field(() => Captcha)
  captcha: Captcha;

  @Field(() => ApiConfig)
  api: ApiConfig;

  onboarding: OnboardingConfig | null;

  @Field(() => Boolean)
  canManageFeatureFlags: boolean;

  @Field(() => [PublicFeatureFlag])
  publicFeatureFlags: PublicFeatureFlag[];

  // Always true now that cookie sessions are the only web auth path. Kept in
  // the schema because removing a field breaks the public API contract.
  @Field(() => Boolean)
  isCookieSessionEnabled: boolean;

  @Field(() => Boolean)
  isMicrosoftMessagingEnabled: boolean;

  @Field(() => Boolean)
  isMicrosoftCalendarEnabled: boolean;

  @Field(() => Boolean)
  isGoogleMessagingEnabled: boolean;

  @Field(() => Boolean)
  isGoogleCalendarEnabled: boolean;

  @Field(() => Boolean)
  isConfigVariablesInDbEnabled: boolean;

  @Field(() => Boolean)
  isImapSmtpCaldavEnabled: boolean;

  @Field(() => Boolean)
  isEmailingDomainInDemoMode: boolean;

  @Field(() => Boolean)
  allowRequestsToTwentyIcons: boolean;

  @Field(() => String, { nullable: true })
  calendarBookingPageId?: string;

  @Field(() => Boolean)
  isBookCallOnboardingStepEnabled: boolean;

  @Field(() => Boolean)
  isCompanyEnrichmentEnabled: boolean;

  @Field(() => Boolean)
  isCloudflareIntegrationEnabled: boolean;

  @Field(() => Boolean)
  isClickHouseConfigured: boolean;

  @Field(() => Boolean)
  isWorkspaceSchemaDDLLocked: boolean;

  @Field(() => Boolean)
  isOnboardingAiChatEnabled: boolean;

  @Field(() => String)
  enterpriseInstanceType: string;

  @Field(() => ClientConfigMaintenanceMode, { nullable: true })
  maintenance?: ClientConfigMaintenanceMode;
}
