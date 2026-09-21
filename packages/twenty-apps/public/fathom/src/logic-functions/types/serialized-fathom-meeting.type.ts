import { type Meeting } from 'fathom-typescript/sdk/models/shared';

// Job payloads travel as JSON, so the Date fields of a Meeting are carried as
// ISO strings and the artifacts fetched separately are left out.
export type SerializedFathomMeeting = Omit<
  Meeting,
  | 'createdAt'
  | 'scheduledStartTime'
  | 'scheduledEndTime'
  | 'recordingStartTime'
  | 'recordingEndTime'
  | 'transcript'
  | 'defaultSummary'
> & {
  createdAt: string;
  scheduledStartTime: string;
  scheduledEndTime: string;
  recordingStartTime: string;
  recordingEndTime: string;
};
