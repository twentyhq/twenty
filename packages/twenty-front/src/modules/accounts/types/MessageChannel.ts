import {
  type MessageChannelType,
  type MessageChannelContactAutoCreationPolicy,
  type MessageChannelSyncStage,
  type MessageChannelSyncStatus,
  type MessageFolderImportPolicy,
} from 'twenty-shared/types';
import { type MessageChannelVisibility } from '~/generated/graphql';

export type MessageChannel = {
  id: string;
  handle: string;
  visibility: MessageChannelVisibility;
  type: MessageChannelType;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: MessageChannelContactAutoCreationPolicy;
  messageFolderImportPolicy: MessageFolderImportPolicy;
  excludeNonProfessionalEmails: boolean;
  excludeGroupEmails: boolean;
  isSyncEnabled: boolean;
  syncStatus: MessageChannelSyncStatus;
  syncStage: MessageChannelSyncStage;
  syncStageStartedAt: string | null;
  connectedAccountId: string;
  connectedAccount: {
    id: string;
    handle: string;
  } | null;
  createdAt: string;
  updatedAt: string;
  __typename: 'MessageChannel';
};
