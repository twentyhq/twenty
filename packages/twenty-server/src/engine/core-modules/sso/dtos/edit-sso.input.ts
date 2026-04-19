/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/Sso/types/SsoConfigurations.type';
import { SsoIdentityProviderStatus } from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';

@InputType()
export class EditSsoInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => SsoIdentityProviderStatus)
  @IsString()
  status: SsoConfiguration['status'];
}
