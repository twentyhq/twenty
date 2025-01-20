import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { UpdateLabPublicFeatureFlagInput } from 'src/engine/core-modules/lab/dtos/update-lab-public-feature-flag.input';
import { LabService } from 'src/engine/core-modules/lab/services/lab.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter)
export class LabResolver {
  constructor(private labService: LabService) {}

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
