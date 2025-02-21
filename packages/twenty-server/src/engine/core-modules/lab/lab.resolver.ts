import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { SettingsFeatures } from 'twenty-shared';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlag } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { UpdateLabPublicFeatureFlagInput } from 'src/engine/core-modules/lab/dtos/update-lab-public-feature-flag.input';
import { LabService } from 'src/engine/core-modules/lab/services/lab.service';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionsGuard(SettingsFeatures.WORKSPACE))
export class LabResolver {
  constructor(private labService: LabService) {}

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => FeatureFlag)
  async updateLabPublicFeatureFlag(
    @Args('input') input: UpdateLabPublicFeatureFlagInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FeatureFlag> {
    return this.labService.updateLabPublicFeatureFlag(workspace.id, input);
  }
}
