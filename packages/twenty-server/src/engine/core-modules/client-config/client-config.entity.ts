import {
  Field,
  GraphQLISODateTime,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';

import { type AiSdkPackage } from 'twenty-shared/ai';
import { FeatureFlagKey } from 'twenty-shared/types';

import { SupportDriver } from 'src/engine/core-modules/twenty-config/interfaces/support.interface';

import { BillingTrialPeriodDTO } from 'src/engine/core-modules/billing/dtos/billing-trial-period.dto';
import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { AuthProvidersDTO } from 'src/engine/core-modules/workspace/dtos/public-workspace-data.dto';
import { AiModelRole } from 'src/engine/metadata-modules/ai/ai-models/types/ai-model-role.enum';
import { ModelFamily } from 'src/engine/metadata-modules/ai/ai-models/types/model-family.enum';
import { type ModelId } from 'src/engine/metadata-modules/ai/ai-models/types/model-id.type';

registerEnumType(FeatureFlagKey, {
  name: 'FeatureFlagKey',
});

registerEnumType(ModelFamily, {
  name: 'ModelFamily',
});

registerEnumType(AiModelRole, {
  name: 'AiModelRole',
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

  @Field(() => Boolean, { nullable: true })
  isRecommended?: boolean;

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
}

@ObjectType()
export class AdminAiModelConfig {
  @Field(() => String)
  // Composite model id (`provider/modelName`) used for toggles, defaults, and registry lookups.
  modelId: string;

  @Field(() => String)
  label: string;

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

  @Field(() => Boolean, { nullable: true })
  isRecommended?: boolean;

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
}

@ObjectType('AdminAiModels')
export class AdminAiModelsDTO {
  @Field(() => [AdminAiModelConfig])
  models: AdminAiModelConfig[];

  @Field(() => String, { nullable: true })
  // Composite model id for the default “smart” role (`provider/modelName`).
  defaultSmartModelId?: string;

  @Field(() => String, { nullable: true })
  // Composite model id for the default “fast” role (`provider/modelName`).
  defaultFastModelId?: string;
}

@ObjectType()
export class Billing {
  @Field(() => Boolean)
  isBillingEnabled: boolean;

  @Field(() => String, { nullable: true })
  billingUrl?: string;

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

@ObjectType()
export class PublicFeatureFlagMetadata {
  @Field(() => String)
  label: string;

  @Field(() => String)
  description: string;

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

  @Field(() => Boolean)
  canManageFeatureFlags: boolean;

  @Field(() => [PublicFeatureFlag])
  publicFeatureFlags: PublicFeatureFlag[];

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
  isEmailGroupEnabled: boolean;

  @Field(() => Boolean)
  allowRequestsToTwentyIcons: boolean;

  @Field(() => String, { nullable: true })
  calendarBookingPageId?: string;

  @Field(() => Boolean)
  isCloudflareIntegrationEnabled: boolean;

  @Field(() => Boolean)
  isClickHouseConfigured: boolean;

  @Field(() => Boolean)
  isWorkspaceSchemaDDLLocked: boolean;

  @Field(() => ClientConfigMaintenanceMode, { nullable: true })
  maintenance?: ClientConfigMaintenanceMode;
}
