export type QueueJobBackoffOptions = {
  strategy: 'fixed' | 'exponential';
  initialDelayMilliseconds: number;
  jitter?: number;
};

export type QueueJobRecipient = {
  workspaceId: string;
  userWorkspaceId: string;
};

export interface QueueJobOptions {
  id?: string;
  allowDuplicatedPrefixes?: boolean;
  priority?: number;
  retryLimit?: number;
  backoff?: QueueJobBackoffOptions;
  delay?: number;
  broadcastTo?: QueueJobRecipient;
  // Drop the job record as soon as it finishes instead of keeping it for the
  // retention window, which frees its id for the next job with the same id
  removeOnComplete?: boolean;
  removeOnFail?: boolean;
}

export interface QueueCronJobOptions extends QueueJobOptions {
  repeat: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
}
