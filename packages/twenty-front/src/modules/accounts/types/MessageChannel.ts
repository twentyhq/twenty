import {
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
  type: string;
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
  createdAt: string;
  updatedAt: string;
  __typename: 'MessageChannel';
};
