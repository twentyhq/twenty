import { ObjectType, Field } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
export class SSOIdentityProvider {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => IdentityProviderType)
  type: IdentityProviderType;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOIdentityProviderStatus;

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

  @Field(() => String)
  subdomain: Workspace['subdomain'];
}
