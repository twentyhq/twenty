import { type Meeting } from 'fathom-typescript/sdk/models/shared';

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
