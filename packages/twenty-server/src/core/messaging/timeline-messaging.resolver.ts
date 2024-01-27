import {
  Args,
  Query,
  Resolver,
  Int,
  ArgsType,
  Field,
  ID,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Max } from 'class-validator';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { TimelineMessagingService } from 'src/core/messaging/timeline-messaging.service';
import { TimelineThread } from 'src/core/messaging/dtos/timeline-thread.dto';
import { TIMELINE_THREADS_MAX_PAGE_SIZE } from 'src/core/messaging/constants/messaging.constants';

@ArgsType()
class GetTimelineThreadsFromPersonIdArgs {
  @Field(() => ID)
  personId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineThreadsFromCompanyIdArgs {
  @Field(() => ID)
  companyId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@UseGuards(JwtAuthGuard)
@Resolver(() => [TimelineThread])
export class TimelineMessagingResolver {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
  ) {}

  @Query(() => [TimelineThread])
  async getTimelineThreadsFromPersonId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args() { personId, page, pageSize }: GetTimelineThreadsFromPersonIdArgs,
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
    @Args() { companyId, page, pageSize }: GetTimelineThreadsFromCompanyIdArgs,
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
