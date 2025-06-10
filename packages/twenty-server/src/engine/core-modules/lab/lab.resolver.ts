import { UseFilters, UseGuards } from '@nestjs/common';
import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { AuthGraphqlApiExceptionFilter } from 'src/engine/core-modules/auth/filters/auth-graphql-api-exception.filter';
import { FeatureFlagDTO } from 'src/engine/core-modules/feature-flag/dtos/feature-flag-dto';
import { FeatureFlagException } from 'src/engine/core-modules/feature-flag/feature-flag.exception';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { UserInputError } from 'src/engine/core-modules/graphql/utils/graphql-errors.util';
import { UpdateLabPublicFeatureFlagInput } from 'src/engine/core-modules/lab/dtos/update-lab-public-feature-flag.input';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { SettingsPermissionsGuard } from 'src/engine/guards/settings-permissions.guard';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { SettingPermissionType } from 'src/engine/metadata-modules/permissions/constants/setting-permission-type.constants';
import { PermissionsGraphqlApiExceptionFilter } from 'src/engine/metadata-modules/permissions/utils/permissions-graphql-api-exception.filter';

@Resolver()
@UseFilters(AuthGraphqlApiExceptionFilter, PermissionsGraphqlApiExceptionFilter)
@UseGuards(SettingsPermissionsGuard(SettingPermissionType.WORKSPACE))
export class LabResolver {
  constructor(private featureFlagService: FeatureFlagService) {}

  @UseGuards(WorkspaceAuthGuard)
  @Mutation(() => FeatureFlagDTO)
  async updateLabPublicFeatureFlag(
    @Args('input') input: UpdateLabPublicFeatureFlagInput,
    @AuthWorkspace() workspace: Workspace,
  ): Promise<FeatureFlagDTO> {
    try {
      const result = await this.featureFlagService.upsertWorkspaceFeatureFlag({
        workspaceId: workspace.id,
        featureFlag: input.publicFeatureFlag,
        value: input.value,
        shouldBePublic: true,
      });

      return result;
    } catch (error) {
      if (error instanceof FeatureFlagException) {
        throw new UserInputError(error.message);
      }
      throw error;
    }
  }
}
