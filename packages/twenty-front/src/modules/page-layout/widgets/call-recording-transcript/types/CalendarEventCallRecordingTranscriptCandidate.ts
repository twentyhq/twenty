import { type CallRecordingStatus } from '~/generated/graphql';

export type CalendarEventCallRecordingTranscriptCandidate = {
  __typename: string;
  id: string;
  status: CallRecordingStatus;
  transcript: unknown;
  startedAt: string | null | undefined;
  endedAt: string | null | undefined;
  createdAt: string | null | undefined;
};
