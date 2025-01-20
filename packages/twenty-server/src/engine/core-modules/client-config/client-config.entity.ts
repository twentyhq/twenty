import { Field, ObjectType } from '@nestjs/graphql';

import { TrialPeriodDTO } from 'src/engine/core-modules/billing/dto/trial-period.dto';
import { CaptchaDriverType } from 'src/engine/core-modules/captcha/interfaces';
import { AuthProviders } from 'src/engine/core-modules/workspace/dtos/public-workspace-data-output';

@ObjectType()
class Billing {
  @Field(() => Boolean)
  isBillingEnabled: boolean;

  @Field(() => String, { nullable: true })
  billingUrl?: string;

  @Field(() => [TrialPeriodDTO])
  trialPeriods: TrialPeriodDTO[];
}

@ObjectType()
class Support {
  @Field(() => String)
  supportDriver: string;

  @Field(() => String, { nullable: true })
  supportFrontChatId?: string;
}

@ObjectType()
class Sentry {
  @Field(() => String, { nullable: true })
  environment?: string;

  @Field(() => String, { nullable: true })
  release?: string;

  @Field(() => String, { nullable: true })
  dsn?: string;
}

@ObjectType()
class Captcha {
  @Field(() => CaptchaDriverType, { nullable: true })
  provider: CaptchaDriverType | undefined;

  @Field(() => String, { nullable: true })
  siteKey: string | undefined;
}

@ObjectType()
class ApiConfig {
  @Field(() => Number, { nullable: false })
  mutationMaximumAffectedRecords: number;
}

@ObjectType()
export class ClientConfig {
  @Field(() => AuthProviders, { nullable: false })
  authProviders: AuthProviders;

  @Field(() => Billing, { nullable: false })
  billing: Billing;

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
  debugMode: boolean;

  @Field(() => Boolean)
  analyticsEnabled: boolean;

  @Field(() => Support)
  support: Support;

  @Field(() => Sentry)
  sentry: Sentry;

  @Field(() => Captcha)
  captcha: Captcha;

  @Field(() => String, { nullable: true })
  chromeExtensionId: string | undefined;

  @Field(() => ApiConfig)
  api: ApiConfig;

  @Field(() => Boolean)
  canManageFeatureFlags: boolean;
}
