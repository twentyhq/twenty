import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UpdateLabsPublicFeatureFlagInput } from 'src/engine/core-modules/labs/dtos/update-labs-public-feature-flag.input';
import { LabsService } from 'src/engine/core-modules/labs/services/labs.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class LabsResolver {
  constructor(private labsService: LabsService) {}

  @Query(() => [FeatureFlagEntity])
  @UseGuards(WorkspaceAuthGuard)
  async getLabsPublicFeatureFlags(
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FeatureFlagEntity[]> {
    return this.labsService.getLabsPublicFeatureFlags(workspace.id);
  }

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => Boolean)
  async updateLabsPublicFeatureFlag(
    @Args() updateFlagInput: UpdateLabsPublicFeatureFlagInput,
  ): Promise<boolean> {
    await this.labsService.updateLabsPublicFeatureFlag(
      updateFlagInput.workspaceId,
      updateFlagInput.publicFeatureFlag,
      updateFlagInput.value,
    );

    return true;
  }
}
