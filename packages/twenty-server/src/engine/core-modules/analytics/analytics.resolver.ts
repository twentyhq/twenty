import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import {
  AnalyticsException,
  AnalyticsExceptionCode,
} from 'src/engine/core-modules/analytics/analytics.exception';

import { AnalyticsService } from './services/analytics.service';
import {
  CreateAnalyticsInput,
  CreateAnalyticsInputV2,
  isPageviewAnalyticsInput,
  isTrackAnalyticsInput,
} from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  // deprecated
  @Mutation(() => Analytics)
  track(
    @Args() _createAnalyticsInput: CreateAnalyticsInput,
    @AuthWorkspace() _workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) _user: User | undefined,
  ) {
    return { success: true };
  }

  @Mutation(() => Analytics)
  async trackAnalytics(
    @Args()
    createAnalyticsInput: CreateAnalyticsInputV2,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    const analyticsContext = this.analyticsService.createAnalyticsContext({
      workspaceId: workspace?.id,
      userId: user?.id,
    });

    if (isPageviewAnalyticsInput(createAnalyticsInput)) {
      return analyticsContext.pageview(
        createAnalyticsInput.name,
        createAnalyticsInput.properties ?? {},
      );
    }

    if (isTrackAnalyticsInput(createAnalyticsInput)) {
      return analyticsContext.track(
        createAnalyticsInput.event,
        createAnalyticsInput.properties ?? {},
      );
    }

    throw new AnalyticsException(
      'Invalid analytics input',
      AnalyticsExceptionCode.INVALID_TYPE,
    );
  }
}
