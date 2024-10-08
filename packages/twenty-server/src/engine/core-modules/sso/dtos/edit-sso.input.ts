import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { SSOIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';

@InputType()
export class EditSsoInput {
  @Field(() => String)
  @IsUUID()
  id: string;

  @Field(() => SSOIdentityProviderStatus)
  @IsString()
  status: SSOConfiguration['status'];
}
