import { UseGuards } from '@nestjs/common';
import { Args, ID, Query } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { AppConnectionObjectDto } from 'src/engine/core-modules/application/connection-provider/connections/dtos/app-connection.object';
import { ListAppConnectionsInput } from 'src/engine/core-modules/application/connection-provider/connections/dtos/list-app-connections.input';
import { ApplicationConnectionsListService } from 'src/engine/core-modules/application/connection-provider/connections/services/application-connections-list.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@MetadataResolver()
export class ApplicationConnectionsResolver {
  constructor(
    private readonly listService: ApplicationConnectionsListService,
  ) {}

  @Query(() => [AppConnectionObjectDto])
  async appConnections(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('filter', { nullable: true }) filter?: ListAppConnectionsInput,
  ): Promise<AppConnectionObjectDto[]> {
    return this.listService.list({
      applicationId: application.id,
      workspaceId: workspace.id,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      filter: filter ?? {},
    });
  }

  @Query(() => AppConnectionObjectDto)
  async appConnection(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<AppConnectionObjectDto> {
    return this.listService.getOne({
      applicationId: application.id,
      workspaceId: workspace.id,
      requestUserWorkspaceId: userWorkspaceId ?? null,
      id,
    });
  }
}
