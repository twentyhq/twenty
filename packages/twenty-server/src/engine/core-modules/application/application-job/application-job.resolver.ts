import { UseFilters, UseGuards, UsePipes } from '@nestjs/common';
import { Args, Mutation } from '@nestjs/graphql';

import { type EnqueueJobResult } from 'twenty-shared/application';

import { MetadataResolver } from 'src/engine/api/graphql/graphql-config/decorators/metadata-resolver.decorator';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { EnqueueJobResultDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job-result.dto';
import { EnqueueJobInputDTO } from 'src/engine/core-modules/application/application-job/dtos/enqueue-job.input';
import { ApplicationJobService } from 'src/engine/core-modules/application/application-job/services/application-job.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type AuthContextUser } from 'src/engine/core-modules/auth/types/auth-context.type';
import { ResolverValidationPipe } from 'src/engine/core-modules/graphql/pipes/resolver-validation.pipe';
import { type FlatWorkspace } from 'src/engine/core-modules/workspace/types/flat-workspace.type';
import { AuthApplication } from 'src/engine/decorators/auth/auth-application.decorator';
import { AuthUserWorkspaceId } from 'src/engine/decorators/auth/auth-user-workspace-id.decorator';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { NoPermissionGuard } from 'src/engine/guards/no-permission.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard, NoPermissionGuard)
@UseFilters(ApplicationExceptionFilter)
@UsePipes(ResolverValidationPipe)
@MetadataResolver()
export class ApplicationJobResolver {
  constructor(private readonly applicationJobService: ApplicationJobService) {}

  @Mutation(() => EnqueueJobResultDTO)
  async enqueueJob(
    @AuthApplication() application: FlatApplication,
    @AuthWorkspace() workspace: FlatWorkspace,
    @AuthUser({ allowUndefined: true }) user: AuthContextUser | undefined,
    @AuthUserWorkspaceId({ allowUndefined: true })
    userWorkspaceId: string | undefined,
    @Args('input') input: EnqueueJobInputDTO,
  ): Promise<EnqueueJobResult> {
    return this.applicationJobService.enqueueJob({
      applicationId: application.id,
      workspaceId: workspace.id,
      userId: user?.id ?? null,
      userWorkspaceId: userWorkspaceId ?? null,
      input,
    });
  }
}
