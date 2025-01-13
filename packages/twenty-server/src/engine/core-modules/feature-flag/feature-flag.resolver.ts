import { UseFilters } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';

import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { GraphqlValidationExceptionFilter } from 'src/filters/graphql-validation-exception.filter';

import { FeatureFlagDTO } from './dtos/feature-flag.dto';
import { FeatureFlagService } from './services/feature-flag.service';

@Resolver(() => FeatureFlagDTO)
@UseFilters(GraphqlValidationExceptionFilter)
export class FeatureFlagResolver {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Query(() => [FeatureFlagDTO])
  async getFeatureFlags(@AuthWorkspace() workspace: Workspace) {
    const featureFlags = await this.featureFlagService.getWorkspaceFeatureFlagsMap(
      workspace.id,
    );

    return Object.entries(featureFlags).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
