/* @license Enterprise */

import { Field, InputType } from '@nestjs/graphql';

import { IsString, IsUUID } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import { SsoIdentityProviderStatus } from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@InputType()
export class EditSsoInput {
  @Field(() => UUIDScalarType)
  @IsUUID()
  id: string;

  @Field(() => SsoIdentityProviderStatus)
  @IsString()
  status: SsoConfiguration['status'];
}
