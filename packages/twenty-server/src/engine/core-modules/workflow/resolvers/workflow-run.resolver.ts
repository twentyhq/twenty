import { Resolver, Subscription } from '@nestjs/graphql';
import { Inject } from '@nestjs/common';

import { PubSub } from 'graphql-subscriptions';

import { WorkflowRunDTO } from 'src/engine/core-modules/workflow/dtos/workflow-run.dto';

@Resolver()
export class WorkflowRunResolver {
  constructor(@Inject('PUB_SUB') private readonly pubSub: PubSub) {}

  @Subscription(() => WorkflowRunDTO)
  workflowRunUpdated() {
    return this.pubSub.asyncIterator('workflowRunUpdated');
  }
}
