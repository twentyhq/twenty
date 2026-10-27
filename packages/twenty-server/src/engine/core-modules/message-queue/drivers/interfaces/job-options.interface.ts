export type QueueJobBackoffOptions = {
  strategy: 'fixed' | 'exponential';
  initialDelayMilliseconds: number;
  jitter?: number;
};

export type QueueJobDeduplicationOptions = {
  id: string;
  keepLastIfActive?: boolean;
};

export type QueueJobRecipient = {
  workspaceId: string;
  userWorkspaceId?: string;
};

export interface QueueJobOptions {
  id?: string;
  doNotCheckDuplicatesBasedOnPrefix?: boolean;
  priority?: number;
  retryLimit?: number;
  backoff?: QueueJobBackoffOptions;
  delay?: number;
  deduplication?: QueueJobDeduplicationOptions;
  broadcastTo?: QueueJobRecipient;
  groupKeys?: string[];
  // Platform only: under IS_WORKER_FAIRNESS_ENABLED the job skips every fair ticket of its queue while its group keys are still charged
  urgent?: boolean;
}

export interface QueueCronJobOptions extends QueueJobOptions {
  repeat: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
}
