import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import GraphQLJSON from 'graphql-type-json';

import { AppManifest } from 'src/engine/core-modules/application/types/application.types';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ApplicationResolver {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
  ) {}

  @Mutation(() => Boolean)
  async syncApplication(
    @Args('manifest', { type: () => GraphQLJSON })
    manifest: AppManifest,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.applicationSyncService.synchronizeFromManifest(
      workspaceId,
      manifest,
    );

    return true;
  }
}
