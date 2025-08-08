/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import { SSOIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@InputType()
export class EditSsoInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => SSOIdentityProviderStatus)
  @IsString()
  status: SSOConfiguration['status'];
}
