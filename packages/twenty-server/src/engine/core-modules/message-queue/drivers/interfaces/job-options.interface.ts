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
  allowDuplicatedPrefixes?: boolean;
  priority?: number;
  retryLimit?: number;
  backoff?: QueueJobBackoffOptions;
  delay?: number;
  deduplication?: QueueJobDeduplicationOptions;
  broadcastTo?: QueueJobRecipient;
}

export interface QueueCronJobOptions extends QueueJobOptions {
  repeat: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
}
