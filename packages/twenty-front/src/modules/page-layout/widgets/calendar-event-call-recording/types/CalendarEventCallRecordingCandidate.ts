import { type CallRecordingStatus } from '~/generated/graphql';

export type CalendarEventCallRecordingCandidate = {
  __typename: 'CallRecording';
  id: string;
  status: CallRecordingStatus;
  transcript: unknown;
  summary: { markdown: string | null } | null | undefined;
  createdAt: string | null | undefined;
};
