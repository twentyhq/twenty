import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
class AvailableAuthProviders {
  @Field(() => Boolean)
  sso: boolean;

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
export class AvailableAuthMethodsOutput {
  @Field(() => String)
  id: string;

  @Field(() => AvailableAuthProviders)
  authProviders: AvailableAuthProviders;
}
