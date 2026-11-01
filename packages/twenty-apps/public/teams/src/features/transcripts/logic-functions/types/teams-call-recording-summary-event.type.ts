import { type ObjectRecordBaseEvent } from 'twenty-sdk/logic-function';

import { type TeamsCallRecordingEventRecord } from 'src/features/transcripts/logic-functions/types/teams-call-recording-event-record.type';

export type TeamsCallRecordingSummaryEvent = Pick<
  ObjectRecordBaseEvent<TeamsCallRecordingEventRecord>,
  'recordId' | 'properties'
>;
