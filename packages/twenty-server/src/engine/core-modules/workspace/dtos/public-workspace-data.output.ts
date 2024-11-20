import { ObjectType, Field } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class SSOIdentityProvider {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String)
  type: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  issuer: string;
}

@ObjectType()
export class AuthProviders {
  @Field(() => [SSOIdentityProvider])
  sso: Array<SSOIdentityProvider>;

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
export class PublicWorkspaceDataOutput {
  @Field(() => String)
  id: string;

  @Field(() => AuthProviders)
  authProviders: AuthProviders;

  @Field(() => String, { nullable: true })
  logo: Workspace['logo'];

  @Field(() => String, { nullable: true })
  displayName: Workspace['displayName'];
}
