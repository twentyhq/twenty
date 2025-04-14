import { Args, Mutation, Resolver } from '@nestjs/graphql';

import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

import { AnalyticsService } from './services/analytics.service';
import {
  CreateAnalyticsInput,
  PageviewAnalyticsInput,
  TrackAnalyticsInput,
} from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Mutation(() => Analytics)
  async track(
    @Args({ type: () => CreateAnalyticsInput })
    createAnalyticsInput: PageviewAnalyticsInput | TrackAnalyticsInput,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    const analyticsContext = this.analyticsService.createAnalyticsContext({
      workspaceId: workspace?.id,
      userId: user?.id,
    });

    if (createAnalyticsInput.type === 'pageview') {
      return analyticsContext.pageview(
        createAnalyticsInput.name,
        createAnalyticsInput.properties,
      );
    }

    return analyticsContext.track(
      createAnalyticsInput.event,
      createAnalyticsInput.properties,
    );
  }
}
