import { type CallRecordingStatus } from '~/generated/graphql';

export type CalendarEventCallRecording = {
  id: string;
  status: CallRecordingStatus;
};
