import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class AuthProviders {
  @Field(() => Boolean)
  google: boolean;

  @Field(() => Boolean)
  magicLink: boolean;

  @Field(() => Boolean)
  password: boolean;

  @Field(() => Boolean)
  microsoft: boolean;
}

@ObjectType()
class Telemetry {
  @Field(() => Boolean)
  enabled: boolean;

  @Field(() => Boolean)
  anonymizationEnabled: boolean;
}

@ObjectType()
class Billing {
  @Field(() => Boolean)
  isBillingEnabled: boolean;

  @Field(() => String, { nullable: true })
  billingUrl?: string;

  @Field(() => Number, { nullable: true })
  billingFreeTrialDurationInDays?: number;
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
export class ClientConfig {
  @Field(() => AuthProviders, { nullable: false })
  authProviders: AuthProviders;

  @Field(() => Telemetry, { nullable: false })
  telemetry: Telemetry;

  @Field(() => Billing, { nullable: false })
  billing: Billing;

  @Field(() => Boolean)
  signInPrefilled: boolean;

  @Field(() => Boolean)
  signUpDisabled: boolean;

  @Field(() => Boolean)
  debugMode: boolean;

  @Field(() => Support)
  support: Support;

  @Field(() => Sentry)
  sentry: Sentry;
}
