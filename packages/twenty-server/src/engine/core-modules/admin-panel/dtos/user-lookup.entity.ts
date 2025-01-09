import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
class UserInfo {
  @Field(() => String)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName?: string;

  @Field(() => String, { nullable: true })
  lastName?: string;
}

@ObjectType()
class WorkspaceFeatureFlag {
  @Field(() => String)
  key: string;

  @Field(() => Boolean)
  value: boolean;
}

@ObjectType()
class WorkspaceInfo {
  @Field(() => String)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => Boolean)
  allowImpersonation: boolean;

  @Field(() => String, { nullable: true })
  logo?: string;

  @Field(() => Number)
  totalUsers: number;

  @Field(() => [UserInfo])
  users: UserInfo[];

  @Field(() => Boolean)
  canManageFeatureFlags: boolean;

  @Field(() => [WorkspaceFeatureFlag])
  featureFlags: WorkspaceFeatureFlag[];
}

@ObjectType()
export class UserLookup {
  @Field(() => UserInfo)
  user: UserInfo;

  @Field(() => [WorkspaceInfo])
  workspaces: WorkspaceInfo[];
}
