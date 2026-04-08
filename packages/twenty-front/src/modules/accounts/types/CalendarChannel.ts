import {
  type CalendarChannelContactAutoCreationPolicy,
  type CalendarChannelSyncStage,
  type CalendarChannelSyncStatus,
} from 'twenty-shared/types';
import { type CalendarChannelVisibility } from '~/generated/graphql';

export type CalendarChannel = {
  id: string;
  handle: string;
  visibility: CalendarChannelVisibility;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;
  isSyncEnabled: boolean;
  syncStatus: CalendarChannelSyncStatus;
  syncStage: CalendarChannelSyncStage;
  syncStageStartedAt: string | null;
  connectedAccountId: string;
  createdAt: string;
  updatedAt: string;
  __typename: 'CalendarChannel';
};
