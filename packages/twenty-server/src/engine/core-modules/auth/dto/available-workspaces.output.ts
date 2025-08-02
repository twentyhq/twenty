/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { SSOConfiguration } from 'src/engine/core-modules/sso/types/SSOConfigurations.type';
import {
  IdentityProviderType,
  SSOIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { WorkspaceUrls } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType()
class SSOConnection {
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
}

@ObjectType()
export class AvailableWorkspace {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  displayName?: string;

  @Field(() => String, { nullable: true })
  loginToken?: string;

  @Field(() => String, { nullable: true })
  personalInviteToken?: string;

  @Field(() => String, { nullable: true })
  inviteHash?: string;

  @Field(() => WorkspaceUrls)
  workspaceUrls: WorkspaceUrls;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => [SSOConnection])
  sso: SSOConnection[];
}

@ObjectType()
export class AvailableWorkspaces {
  @Field(() => [AvailableWorkspace])
  availableWorkspacesForSignIn: Array<AvailableWorkspace>;

  @Field(() => [AvailableWorkspace])
  availableWorkspacesForSignUp: Array<AvailableWorkspace>;
}
