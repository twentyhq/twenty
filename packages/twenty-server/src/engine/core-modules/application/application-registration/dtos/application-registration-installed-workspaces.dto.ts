import { Field, Int, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationState } from 'src/engine/core-modules/application/enums/application-state.enum';

@ObjectType('InstalledWorkspace')
export class InstalledWorkspaceDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String, { nullable: true })
  displayName: string | null;

  @Field(() => String, { nullable: true })
  logo: string | null;

  @Field(() => String, { nullable: true })
  version: string | null;

  @Field(() => ApplicationState)
  state: ApplicationState;
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
