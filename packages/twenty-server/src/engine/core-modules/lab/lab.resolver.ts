import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { GetLabPublicFeatureFlagsInput } from 'src/engine/core-modules/lab/dtos/get-lab-public-feature-flags.input';
import { UpdateLabPublicFeatureFlagInput } from 'src/engine/core-modules/lab/dtos/update-lab-public-feature-flag.input';
import { LabService } from 'src/engine/core-modules/lab/services/lab.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class LabResolver {
  constructor(private labService: LabService) {}

  @Query(() => [FeatureFlagEntity])
  @UseGuards(WorkspaceAuthGuard)
  async getLabPublicFeatureFlags(
    @Args() getLabPublicFeatureFlagsInput: GetLabPublicFeatureFlagsInput,
  ): Promise<FeatureFlagEntity[]> {
    return this.labService.getLabPublicFeatureFlags(
      getLabPublicFeatureFlagsInput.workspaceId,
    );
  }

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => Boolean)
  async updateLabPublicFeatureFlag(
    @Args() updateFlagInput: UpdateLabPublicFeatureFlagInput,
  ): Promise<boolean> {
    await this.labService.updateLabPublicFeatureFlag(
      updateFlagInput.workspaceId,
      updateFlagInput.publicFeatureFlag,
      updateFlagInput.value,
    );

    return true;
  }
}
