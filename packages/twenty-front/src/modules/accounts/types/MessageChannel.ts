import { MessageChannelVisibility } from '~/generated/graphql';

export enum MessageChannelContactAutoCreationPolicy {
  SENT_AND_RECEIVED = 'SENT_AND_RECEIVED',
  SENT = 'SENT',
  NONE = 'NONE',
}

export enum MessageChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum MessageChannelSyncStage {
  FULL_MESSAGE_LIST_FETCH_PENDING = 'FULL_MESSAGE_LIST_FETCH_PENDING',
  PARTIAL_MESSAGE_LIST_FETCH_PENDING = 'PARTIAL_MESSAGE_LIST_FETCH_PENDING',
  MESSAGE_LIST_FETCH_ONGOING = 'MESSAGE_LIST_FETCH_ONGOING',
  MESSAGES_IMPORT_PENDING = 'MESSAGES_IMPORT_PENDING',
  MESSAGES_IMPORT_ONGOING = 'MESSAGES_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export type MessageChannel = {
  id: string;
  handle: string;
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;
  excludeNonProfessionalEmails: boolean;
  excludeGroupEmails: boolean;
  isSyncEnabled: boolean;
  visibility: MessageChannelVisibility;
  syncStatus: MessageChannelSyncStatus;
  syncStage: MessageChannelSyncStage;
  syncCursor: string;
  syncStageStartedAt: Date;
  throttleFailureCount: number;
  __typename: 'MessageChannel';
};
