import { Field, ObjectType } from '@nestjs/graphql';

import {
  IdpType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

@ObjectType()
export class EditSsoOutput {
  @Field(() => String)
  id: string;

  @Field(() => IdpType)
  type: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOConfiguration['status'];
}
