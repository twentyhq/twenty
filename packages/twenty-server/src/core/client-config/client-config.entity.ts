import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class AuthProviders {
  @Field(() => Boolean)
  google: boolean;

  @Field(() => Boolean)
  magicLink: boolean;

  @Field(() => Boolean)
  password: boolean;
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

  @Field(() => String)
  billingUrl: string;
}

@ObjectType()
class Support {
  @Field(() => String)
  supportDriver: string;

  @Field(() => String, { nullable: true })
  supportFrontChatId: string | undefined;
}

@ObjectType()
class Sentry {
  @Field(() => String)
  dsn: string | undefined;
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
  debugMode: boolean;

  @Field(() => Support)
  support: Support;

  @Field(() => Sentry)
  sentry: Sentry;
}
