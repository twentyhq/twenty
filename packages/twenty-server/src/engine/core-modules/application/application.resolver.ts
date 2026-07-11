import { UseGuards } from '@nestjs/common';
import { Parent, ResolveField } from '@nestjs/graphql';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { WorkspaceDomainsService } from 'src/engine/core-modules/domain/workspace-domains/services/workspace-domains.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@MetadataResolver(() => ApplicationDTO)
export class ApplicationResolver {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly workspaceDomainsService: WorkspaceDomainsService,
  ) {}

  // Must stay identical to the TWENTY_FUNCTIONS_URL the executor injects.
  @ResolveField(() => String)
  async functionsBaseUrl(
    @Parent() application: ApplicationDTO,
    @AuthWorkspace() workspace: WorkspaceEntity,
  ): Promise<string> {
    const primaryPublicDomain =
      await this.applicationService.findPrimaryPublicDomainName({
        applicationId: application.id,
        workspaceId: workspace.id,
      });

    return this.workspaceDomainsService.buildFunctionsBaseUrl({
      workspace,
      primaryPublicDomain,
    });
  }
}
