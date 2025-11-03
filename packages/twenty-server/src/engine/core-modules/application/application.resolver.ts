import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { ApplicationExceptionFilter } from 'src/engine/core-modules/application/application-exception-filter';
import { ApplicationSyncService } from 'src/engine/core-modules/application/application-sync.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { ApplicationDTO } from 'src/engine/core-modules/application/dtos/application.dto';
import { ApplicationInput } from 'src/engine/core-modules/application/dtos/application.input';
import { DeleteApplicationInput } from 'src/engine/core-modules/application/dtos/deleteApplication.input';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { RequireFeatureFlag } from 'src/engine/guards/feature-flag.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver()
@UseFilters(ApplicationExceptionFilter)
export class ApplicationResolver {
  constructor(
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly applicationService: ApplicationService,
  ) {}

  @Query(() => [ApplicationDTO])
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findManyApplications(
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return this.applicationService.findManyApplications(workspaceId);
  }

  @Query(() => ApplicationDTO)
  @RequireFeatureFlag(FeatureFlagKey.IS_APPLICATION_ENABLED)
  async findOneApplication(
    @Args('id', { type: () => UUIDScalarType }) id: string,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    return await this.applicationService.findOneApplication(id, workspaceId);
  }

  @Mutation(() => Boolean)
  async syncApplication(
    @Args() { manifest, packageJson, yarnLock }: ApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
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
    @Args() { universalIdentifier }: DeleteApplicationInput,
    @AuthWorkspace() { id: workspaceId }: WorkspaceEntity,
  ) {
    await this.applicationSyncService.deleteApplication({
      applicationUniversalIdentifier: universalIdentifier,
      workspaceId,
    });

    return true;
  }
}
