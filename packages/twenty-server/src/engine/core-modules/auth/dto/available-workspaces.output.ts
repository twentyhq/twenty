/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
class SSOConnection {
  @Field(() => IdentityProviderType)
  type: SSOConfiguration['type'];

  @Field(() => String)
  id: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOConfiguration['status'];
}

@ObjectType()
export class AvailableWorkspaceOutput {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String)
  subdomain: string;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => [SSOConnection])
  sso: SSOConnection[];
}
