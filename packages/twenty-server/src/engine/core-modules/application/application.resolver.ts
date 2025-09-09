import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

import { ApplicationDTO } from './dtos/application.dto';
import { SyncApplicationInput } from './dtos/sync-application.input';
import { ApplicationSyncService } from './services/application-sync.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ApplicationResolver {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
  ) {}

  @Mutation(() => ApplicationDTO)
  async syncApplication(
    @Args('input') input: SyncApplicationInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ): Promise<ApplicationDTO> {
    const application =
      await this.applicationSyncService.synchronizeFromManifest(
        workspaceId,
        input.manifest,
      );

    return application;
  }
}
