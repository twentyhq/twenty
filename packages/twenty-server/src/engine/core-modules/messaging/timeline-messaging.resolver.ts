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

import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { AuthWorkspace } from 'src/engine/decorators/auth/auth-workspace.decorator';
import { TimelineMessagingService } from 'src/engine/core-modules/messaging/timeline-messaging.service';
import { TIMELINE_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';

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
@Resolver(() => TimelineThreadsWithTotal)
export class TimelineMessagingResolver {
  constructor(
    private readonly timelineMessagingService: TimelineMessagingService,
    private readonly userService: UserService,
  ) {}

  @Query(() => TimelineThreadsWithTotal)
  async getTimelineThreadsFromPersonId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { personId, page, pageSize }: GetTimelineThreadsFromPersonIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromPersonIds(
        workspaceMember.id,
        workspaceId,
        [personId],
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Query(() => TimelineThreadsWithTotal)
  async getTimelineThreadsFromCompanyId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { companyId, page, pageSize }: GetTimelineThreadsFromCompanyIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromCompanyId(
        workspaceMember.id,
        workspaceId,
        companyId,
        page,
        pageSize,
      );

    return timelineThreads;
  }
}
