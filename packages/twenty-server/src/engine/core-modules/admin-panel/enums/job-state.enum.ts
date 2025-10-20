import { registerEnumType } from '@nestjs/graphql';

export enum JobState {
  completed = 'completed',
  failed = 'failed',
  active = 'active',
  waiting = 'waiting',
  delayed = 'delayed',
  paused = 'paused',
}

registerEnumType(JobState, {
  name: 'JobState',
  description: 'Job state in the queue',
});
