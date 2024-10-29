import { ObjectType, Field } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';

@ObjectType()
export class AuthProviders {
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
