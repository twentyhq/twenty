export type MeetTranscript = {
  name: string;
  state?: 'STATE_UNSPECIFIED' | 'STARTED' | 'ENDED' | 'FILE_GENERATED';
  startTime?: string;
  endTime?: string;
  docsDestination?: { document?: string; exportUri?: string };
};
