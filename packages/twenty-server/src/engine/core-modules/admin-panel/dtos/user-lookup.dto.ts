import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag.dto';
import { WorkspaceUrlsDTO } from 'src/engine/core-modules/workspace/dtos/workspace-urls.dto';

@ObjectType('UserInfo')
class UserInfoDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}

@ObjectType('WorkspaceInfo')
class WorkspaceInfoDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  allowImpersonation: boolean;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => Number)
  totalUsers: number;

  @Field(() => WorkspaceUrlsDTO)
  workspaceUrls: WorkspaceUrlsDTO;

  @Field(() => [UserInfoDTO])
  users: UserInfoDTO[];

  @Field(() => [FeatureFlagDTO])
  featureFlags: FeatureFlagDTO[];
}

@ObjectType('UserLookup')
export class UserLookup {
  @Field(() => UserInfoDTO)
  user: UserInfoDTO;

  @Field(() => [WorkspaceInfoDTO])
  workspaces: WorkspaceInfoDTO[];
}
