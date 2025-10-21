import { registerEnumType } from '@nestjs/graphql';

import { type JobState as BullMQJobState } from 'bullmq/dist/esm/types';

export enum JobStateEnum {
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  ACTIVE = 'ACTIVE',
  WAITING = 'WAITING',
  DELAYED = 'DELAYED',
  PRIORITIZED = 'PRIORITIZED',
  WAITING_CHILDREN = 'WAITING_CHILDREN',
}

registerEnumType(JobStateEnum, {
  name: 'JobState',
  description: 'Job state in the queue',
});

// Mapping from GraphQL enum to BullMQ state values
export const jobStateEnumToBullMQ: Record<JobStateEnum, BullMQJobState> = {
  [JobStateEnum.COMPLETED]: 'completed',
  [JobStateEnum.FAILED]: 'failed',
  [JobStateEnum.ACTIVE]: 'active',
  [JobStateEnum.WAITING]: 'waiting',
  [JobStateEnum.DELAYED]: 'delayed',
  [JobStateEnum.PRIORITIZED]: 'prioritized',
  [JobStateEnum.WAITING_CHILDREN]: 'waiting-children',
};

// Mapping from BullMQ state values to GraphQL enum
export const bullMQToJobStateEnum: Record<BullMQJobState, JobStateEnum> = {
  completed: JobStateEnum.COMPLETED,
  failed: JobStateEnum.FAILED,
  active: JobStateEnum.ACTIVE,
  waiting: JobStateEnum.WAITING,
  delayed: JobStateEnum.DELAYED,
  prioritized: JobStateEnum.PRIORITIZED,
  'waiting-children': JobStateEnum.WAITING_CHILDREN,
};
