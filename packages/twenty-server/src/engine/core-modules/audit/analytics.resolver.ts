import { Args, Mutation, Resolver } from '@nestjs/graphql';

import {
    AnalyticsException,
    AuditExceptionCode,
} from 'src/engine/core-modules/audit/audit.exception';
import { User } from 'src/engine/core-modules/user/user.entity';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';

import {
    CreateAnalyticsInputV2,
    isPageviewAnalyticsInput,
    isTrackAnalyticsInput,
} from './dtos/create-analytics.input';
import { Analytics } from './entities/analytics.entity';
import { AuditService } from './services/audit.service';

@Resolver(() => Analytics)
export class AnalyticsResolver {
  constructor(private readonly auditService: AuditService) {}

  // preparing for new name
  async auditTrack(
    @Args()
    createAnalyticsInput: CreateAnalyticsInputV2,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    return this.trackAnalytics(createAnalyticsInput, workspace, user);
  }

  @Mutation(() => Analytics)
  async trackAnalytics(
    @Args()
    createAnalyticsInput: CreateAnalyticsInputV2,
    @AuthWorkspace() workspace: Workspace | undefined,
    @AuthUser({ allowUndefined: true }) user: User | undefined,
  ) {
    const analyticsContext = this.auditService.createAnalyticsContext({
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
      AuditExceptionCode.INVALID_TYPE,
    );
  }
}
