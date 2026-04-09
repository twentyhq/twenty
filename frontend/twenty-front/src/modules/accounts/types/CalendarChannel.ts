import { type CalendarChannelVisibility } from '~/generated/graphql';

export enum CalendarChannelSyncStatus {
  NOT_SYNCED = 'NOT_SYNCED',
  ONGOING = 'ONGOING',
  ACTIVE = 'ACTIVE',
  FAILED_INSUFFICIENT_PERMISSIONS = 'FAILED_INSUFFICIENT_PERMISSIONS',
  FAILED_UNKNOWN = 'FAILED_UNKNOWN',
}

export enum CalendarChannelSyncStage {
  PENDING_CONFIGURATION = 'PENDING_CONFIGURATION',
  CALENDAR_EVENT_LIST_FETCH_PENDING = 'CALENDAR_EVENT_LIST_FETCH_PENDING',
  CALENDAR_EVENT_LIST_FETCH_SCHEDULED = 'CALENDAR_EVENT_LIST_FETCH_SCHEDULED',
  CALENDAR_EVENT_LIST_FETCH_ONGOING = 'CALENDAR_EVENT_LIST_FETCH_ONGOING',
  CALENDAR_EVENTS_IMPORT_PENDING = 'CALENDAR_EVENTS_IMPORT_PENDING',
  CALENDAR_EVENTS_IMPORT_SCHEDULED = 'CALENDAR_EVENTS_IMPORT_SCHEDULED',
  CALENDAR_EVENTS_IMPORT_ONGOING = 'CALENDAR_EVENTS_IMPORT_ONGOING',
  FAILED = 'FAILED',
}

export enum CalendarChannelContactAutoCreationPolicy {
  AS_PARTICIPANT_AND_ORGANIZER = 'AS_PARTICIPANT_AND_ORGANIZER',
  AS_PARTICIPANT = 'AS_PARTICIPANT',
  AS_ORGANIZER = 'AS_ORGANIZER',
  NONE = 'NONE',
}
export type CalendarChannel = {
  id: string;
  handle: string;
  isContactAutoCreationEnabled: boolean;
  contactAutoCreationPolicy: CalendarChannelContactAutoCreationPolicy;
  isSyncEnabled: boolean;
  visibility: CalendarChannelVisibility;
  syncStatus: CalendarChannelSyncStatus;
  syncStage: CalendarChannelSyncStage;
  syncCursor: string;
  syncStageStartedAt: Date;
  throttleFailureCount: number;
  __typename: 'CalendarChannel';
};
