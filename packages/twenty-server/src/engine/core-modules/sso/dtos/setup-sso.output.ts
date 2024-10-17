/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
export class SetupSsoOutput {
  @Field(() => String)
  id: string;

  @Field(() => IdentityProviderType)
  type: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOConfiguration['status'];
}
