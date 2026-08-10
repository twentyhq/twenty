import { type CallRecordingStatus } from '~/generated/graphql';

export type CalendarEventCallRecordingTranscriptCandidate = {
  __typename: 'CallRecording';
  id: string;
  status: CallRecordingStatus;
  transcript: unknown;
  createdAt: string | null | undefined;
};
