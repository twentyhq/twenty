/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/Sso/types/SsoConfigurations.type';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';

@ObjectType('SetupSso')
export class SetupSsoDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => IdentityProviderType)
  type: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SsoIdentityProviderStatus)
  status: SsoConfiguration['status'];
}
