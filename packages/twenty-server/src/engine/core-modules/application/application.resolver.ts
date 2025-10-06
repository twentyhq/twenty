import { UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { DeleteApplicationInput } from 'src/engine/core-modules/application/dtos/deleteApplication.input';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
export class ApplicationResolver {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Mutation(() => Boolean)
  async syncApplication(
    @Args() { manifest, packageJson, yarnLock }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.applicationSyncService.synchronizeFromManifest({
      workspaceId,
      manifest,
      yarnLock,
      packageJson,
    });

    return true;
  }

  @Mutation(() => Boolean)
  async deleteApplication(
    @Args() { packageJson }: DeleteApplicationInput,
    @AuthWorkspace() { id: workspaceId }: Workspace,
  ) {
    await this.applicationService.delete(
      packageJson.universalIdentifier,
      workspaceId,
    );

    return true;
  }
}
