import { UseGuards } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';

import { Inbox } from 'src/engine/core-modules/inbox/inbox.entity';
import { InboxService } from 'src/engine/core-modules/inbox/inbox.service';
import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';

@UseGuards(WorkspaceAuthGuard)
@Resolver(() => Inbox)
export class InboxResolver {
  constructor(private readonly inboxService: InboxService) {}

  @Query(() => [Inbox])
  async inboxesByWorkspace(@Args('workspaceId') workspaceId: string) {
    return await this.inboxService.findAll(workspaceId);
  }
}
