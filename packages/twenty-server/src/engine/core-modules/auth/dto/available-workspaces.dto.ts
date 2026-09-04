/* @license Enterprise */

import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { type SsoConfiguration } from 'src/engine/core-modules/sso/types/sso-configurations.type';
import {
  IdentityProviderType,
  SsoIdentityProviderStatus,
} from 'src/engine/core-modules/sso/workspace-sso-identity-provider.entity';
import { WorkspaceUrlsDTO } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType('SSOConnection')
class SsoConnectionDTO {
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
}

@ObjectType('AvailableWorkspace')
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

  @Field(() => WorkspaceUrlsDTO)
  workspaceUrls: WorkspaceUrlsDTO;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => [SsoConnectionDTO])
  sso: SsoConnectionDTO[];
}

@ObjectType('AvailableWorkspaces')
export class AvailableWorkspaces {
  @Field(() => [AvailableWorkspace])
  availableWorkspacesForSignIn: Array<AvailableWorkspace>;

  @Field(() => [AvailableWorkspace])
  availableWorkspacesForSignUp: Array<AvailableWorkspace>;
}
