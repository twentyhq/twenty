/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/Sso/types/SsoConfigurations.type';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
} from 'src/engine/core-modules/Sso/workspace-Sso-identity-provider.entity';

@ObjectType()
class WorkspaceNameAndId {
  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field(() => UUIDScalarType)
  id: string;
}

@ObjectType('FindAvailableSsoIDP')
export class FindAvailableSsoIDPDTO {
  @Field(() => IdentityProviderType)
  type: SsoConfiguration['type'];

  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SsoIdentityProviderStatus)
  status: SsoConfiguration['status'];

  @Field(() => WorkspaceNameAndId)
  workspace: WorkspaceNameAndId;
}
