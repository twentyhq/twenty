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

export type WorkspaceQueueJobScope = {
  isSystemJob?: never;
  workspaceId: string;
  // Core jobs pass TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
  applicationUniversalIdentifier: string;
};

export type SystemQueueJobScope = {
  isSystemJob: true;
  workspaceId?: never;
  applicationUniversalIdentifier?: never;
};

export type QueueJobScope = WorkspaceQueueJobScope | SystemQueueJobScope;

export type QueueJobSettings = {
  id?: string;
  doNotCheckDuplicatesBasedOnPrefix?: boolean;
  priority?: number;
  retryLimit?: number;
  backoff?: QueueJobBackoffOptions;
  delay?: number;
  deduplication?: QueueJobDeduplicationOptions;
  broadcastTo?: QueueJobRecipient;
};

export type QueueJobOptions = QueueJobSettings & QueueJobScope;

export type QueueCronJobOptions = Pick<QueueJobSettings, 'priority'> & {
  repeat: {
    every?: number;
    pattern?: string;
    limit?: number;
  };
};
