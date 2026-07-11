import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ApplicationDTO)
export class ApplicationResolver {
  constructor(private readonly applicationService: ApplicationService) {}

  @ResolveField(() => String)
  async functionsBaseUrl(
    @Parent() application: ApplicationDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    return this.applicationService.buildFunctionsBaseUrl({
      applicationId: application.id,
      workspaceId: workspace.id,
    });
  }
}
