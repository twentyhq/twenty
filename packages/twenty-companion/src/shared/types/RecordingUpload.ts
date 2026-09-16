import { type RecordingConfiguration } from './RecordingConfiguration';

export type RecordingUpload = RecordingConfiguration & {
  callRecordingId: string;
  uploadToken: string;
};
