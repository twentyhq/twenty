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

export type SystemQueueJobScope = {
  isSystemJob: true;
  isWorkspaceJob?: never;
  workspaceId?: never;
  applicationUniversalIdentifier?: never;
};

export type WorkspaceQueueJobScope = {
  isSystemJob?: never;
  isWorkspaceJob: true;
  workspaceId: string;
  applicationUniversalIdentifier?: never;
};

export type ApplicationQueueJobScope = {
  isSystemJob?: never;
  isWorkspaceJob?: never;
  workspaceId: string;
  applicationUniversalIdentifier: string;
};

export type QueueJobScope =
  | SystemQueueJobScope
  | WorkspaceQueueJobScope
  | ApplicationQueueJobScope;

export type QueueJobSettings = {
  id?: string;
  doNotCheckDuplicatesBasedOnPrefix?: boolean;
  priority?: number;
  retryLimit?: number;
  backoff?: QueueJobBackoffOptions;
  delay?: number;
  deduplication?: QueueJobDeduplicationOptions;
  broadcastTo?: QueueJobRecipient;
  groupKeys?: string[];
};

export type QueueJobOptions = QueueJobSettings & QueueJobScope;

export type QueueCronJobOptions = Pick<QueueJobSettings, 'priority'> & {
  repeat: {
    every?: number;
    pattern?: string;
    tz?: string;
    limit?: number;
  };
};
