import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

@Resolver()
export class WorkflowRunResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => String)
  workflowRunUpdated() {
    return this.pubSub.asyncIterator('workflowRunUpdated');
  }
}
