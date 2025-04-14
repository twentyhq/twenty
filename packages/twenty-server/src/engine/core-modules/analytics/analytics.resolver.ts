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
  isPageviewAnalyticsInput,
  isTrackAnalyticsInput,
} from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  async track(
    @Args()
    createAnalyticsInput: CreateAnalyticsInput,
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
        createAnalyticsInput.properties,
      );
    }

    if (isTrackAnalyticsInput(createAnalyticsInput)) {
      return analyticsContext.track(
        createAnalyticsInput.event,
        createAnalyticsInput.properties,
      );
    }

    throw new AnalyticsException(
      'Invalid analytics input',
      AnalyticsExceptionCode.INVALID_TYPE,
    );
  }
}
