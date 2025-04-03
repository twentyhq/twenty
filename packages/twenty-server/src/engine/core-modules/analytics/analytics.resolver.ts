import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { makePageview, makeUnsafeEvent } from 'twenty-analytics';

import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

import { AnalyticsService } from './services/analytics.service';
import { CreateAnalyticsInput } from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  async track(
    @Args() createAnalyticsInput: CreateAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    const analyticsContext = this.analyticsService.createAnalyticsContext(
      user?.id,
      workspace?.id,
    );

    if (createAnalyticsInput.action === 'pageview') {
      return analyticsContext.sendPageview(
        makePageview(createAnalyticsInput.payload),
      );
    }

    return analyticsContext.sendEvent(
      makeUnsafeEvent(createAnalyticsInput.payload),
    );
  }
}
