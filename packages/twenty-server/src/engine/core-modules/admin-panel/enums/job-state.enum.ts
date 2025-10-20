import { registerEnumType } from '@nestjs/graphql';

import { type JobState as BullMQJobState } from 'bullmq/dist/esm/types';

export type JobState = BullMQJobState;

// Create a GraphQL enum that matches BullMQ's JobState
// This is only used for GraphQL schema generation
export enum JobStateEnum {
  completed = 'completed',
  failed = 'failed',
  active = 'active',
  waiting = 'waiting',
  delayed = 'delayed',
  prioritized = 'prioritized',
  waitingChildren = 'waiting-children',
}

registerEnumType(JobStateEnum, {
  name: 'JobState',
  description: 'Job state in the queue',
});
