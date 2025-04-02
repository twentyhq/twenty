import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { RedisPubSub } from 'graphql-redis-subscriptions';

import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';

@Resolver()
export class WorkflowRunResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: RedisPubSub) {}

  @Subscription(() => WorkflowRunDTO)
  workflowRunUpdated() {
    return this.pubSub.asyncIterator('workflowRunUpdated');
  }
}
