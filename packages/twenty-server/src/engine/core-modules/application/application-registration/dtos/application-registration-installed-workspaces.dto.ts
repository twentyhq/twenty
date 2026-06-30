import { Field, Int, ObjectType } from '@nestjs/graphql';

@ObjectType('InstalledWorkspace')
export class InstalledWorkspaceDTO {
  @Field(() => String)
  id: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  logo: string | null;

  @Field(() => String, { nullable: true })
  version: string | null;
}

@ObjectType('ApplicationRegistrationInstalledWorkspaces')
export class ApplicationRegistrationInstalledWorkspacesDTO {
  @Field(() => [InstalledWorkspaceDTO])
  workspaces: InstalledWorkspaceDTO[];

  @Field(() => Int)
  totalCount: number;

  @Field(() => Boolean)
  hasMore: boolean;
}
