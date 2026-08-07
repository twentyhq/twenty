import { type CallRecordingStatus } from '~/generated/graphql';

export type CalendarEventCallRecordingTranscriptCandidate = {
  __typename: string;
  id: string;
  status: CallRecordingStatus;
  transcript: unknown;
  createdAt: string | null | undefined;
};
