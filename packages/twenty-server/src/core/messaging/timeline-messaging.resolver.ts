import { Args, Query, Resolver, Int } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { TimelineMessagingService } from 'src/core/messaging/timeline-messaging.service';
import { TimelineThread } from 'src/core/messaging/timeline-thread.dto';

@UseGuards(JwtAuthGuard)
@Resolver(() => [TimelineThread])
export class TimelineMessagingResolver {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
  ) {}

  @Query(() => [TimelineThread])
  async getTimelineThreadsFromPersonId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('personId') personId: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('pageSize', { type: () => Int }) pageSize: number,
  ) {
    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromPersonIds(
        workspaceId,
        [personId],
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Query(() => [TimelineThread])
  async getTimelineThreadsFromCompanyId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('companyId') companyId: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('pageSize', { type: () => Int }) pageSize: number,
  ) {
    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromCompanyId(
        workspaceId,
        companyId,
        page,
        pageSize,
      );

    return timelineThreads;
  }
}
