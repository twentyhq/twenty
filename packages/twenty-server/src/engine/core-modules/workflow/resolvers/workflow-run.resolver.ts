import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject, UseGuards } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

import { WorkspaceAuthGuard } from 'src/engine/guards/workspace-auth.guard';
import { UserAuthGuard } from 'src/engine/guards/user-auth.guard';

@Resolver()
@UseGuards(WorkspaceAuthGuard, UserAuthGuard)
export class WorkflowRunResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => String)
  workflowRunUpdated() {
    return this.pubSub.asyncIterator('workflowRunUpdated');
  }
}
