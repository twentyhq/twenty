import { UseGuards } from '@nestjs/common';
import { Args, ArgsType, Field, Int, Query, Resolver } from '@nestjs/graphql';

import { Max } from 'class-validator';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';
import { TIMELINE_THREADS_MAX_PAGE_SIZE } from 'src/engine/core-modules/messaging/constants/messaging.constants';
import { TimelineThreadsWithTotal } from 'src/engine/core-modules/messaging/dtos/timeline-threads-with-total.dto';
import { GetMessagesFromCompanyIdService } from 'src/engine/core-modules/messaging/services/get-messages-from-company-id.service';
import { GetMessagesFromPersonIdsService } from 'src/engine/core-modules/messaging/services/get-messages-from-person-ids.service';
import { UserService } from 'src/engine/core-modules/user/services/user.service';
import { User } from 'src/engine/core-modules/user/user.entity';
import { AuthUser } from 'src/engine/decorators/auth/auth-user.decorator';
import { JwtAuthGuard } from 'src/engine/guards/jwt.auth.guard';

@ArgsType()
class GetTimelineThreadsFromPersonIdArgs {
  @Field(() => UUIDScalarType)
  personId: string;

  @Field(() => Int)
  page: number;

  @Field(() => Int)
  @Max(TIMELINE_THREADS_MAX_PAGE_SIZE)
  pageSize: number;
}

@ArgsType()
class GetTimelineThreadsFromCompanyIdArgs {
  @Field(() => UUIDScalarType)
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
    private readonly getMessagesFromPersonIdsService: GetMessagesFromPersonIdsService,
    private readonly getMessagesFromCompanyIdService: GetMessagesFromCompanyIdService,
    private readonly userService: UserService,
  ) {}

  @Query(() => TimelineThreadsWithTotal)
  async getTimelineThreadsFromPersonId(
    // @AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { personId, page, pageSize }: GetTimelineThreadsFromPersonIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.getMessagesFromPersonIdsService.getMessagesFromPersonIds(
        workspaceMember.id,
        [personId],
        page,
        pageSize,
      );

    return timelineThreads;
  }

  @Query(() => TimelineThreadsWithTotal)
  async getTimelineThreadsFromCompanyId(
    //@AuthWorkspace() { id: workspaceId }: Workspace,
    @AuthUser() user: User,
    @Args() { companyId, page, pageSize }: GetTimelineThreadsFromCompanyIdArgs,
  ) {
    const workspaceMember = await this.userService.loadWorkspaceMember(user);

    if (!workspaceMember) {
      return;
    }

    const timelineThreads =
      await this.getMessagesFromCompanyIdService.getMessagesFromCompanyId(
        workspaceMember.id,
        companyId,
        page,
        pageSize,
      );

    return timelineThreads;
  }
}
