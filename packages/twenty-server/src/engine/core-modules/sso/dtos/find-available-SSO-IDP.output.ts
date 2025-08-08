/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';

@ObjectType()
class WorkspaceNameAndId {
  @Field(() => String, { nullable: true })
  displayName?: string | null;

  @Field(() => UUIDScalarType)
  id: string;
}

@ObjectType()
export class FindAvailableSSOIDPOutput {
  @Field(() => IdentityProviderType)
  type: SSOConfiguration['type'];

  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  issuer: string;

  @Field(() => String)
  name: string;

  @Field(() => SSOIdentityProviderStatus)
  status: SSOConfiguration['status'];

  @Field(() => WorkspaceNameAndId)
  workspace: WorkspaceNameAndId;
}
