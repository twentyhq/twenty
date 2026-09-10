/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
class WorkspaceNameAndId {
  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field(() => UUIDScalarType)
  id: string;
}

@ObjectType('FindAvailableSSOIDP')
export class FindAvailableSsoIdpDTO {
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
