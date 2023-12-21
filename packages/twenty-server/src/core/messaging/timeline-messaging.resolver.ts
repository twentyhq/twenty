import { Args, Query, Field, Resolver, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';

import { Column, Entity } from 'typeorm';

import { JwtAuthGuard } from 'src/guards/jwt.auth.guard';
import { Workspace } from 'src/core/workspace/workspace.entity';
import { AuthWorkspace } from 'src/decorators/auth-workspace.decorator';
import { TimelineMessagingService } from 'src/core/messaging/timeline-messaging.service';

@Entity({ name: 'timelineThread', schema: 'core' })
@ObjectType('TimelineThread')
class TimelineThread {
  @Field()
  @Column()
  read: boolean;

  @Field()
  @Column()
  senderName: string;

  @Field()
  @Column()
  senderPictureUrl: string;

  @Field()
  @Column()
  numberOfMessagesInThread: number;

  @Field()
  @Column()
  subject: string;

  @Field()
  @Column()
  body: string;

  @Field()
  @Column()
  receivedAt: Date;
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
    @Args('personId') personId: string,
  ) {
    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromPersonIds(
        workspaceId,
        [personId],
      );

    return timelineThreads;
  }

  @Query(() => [TimelineThread])
  async getTimelineThreadsFromCompanyId(
    @AuthWorkspace() { id: workspaceId }: Workspace,
    @Args('companyId') companyId: string,
  ) {
    const timelineThreads =
      await this.timelineMessagingService.getMessagesFromCompanyId(
        workspaceId,
        companyId,
      );

    return timelineThreads;
  }
}
