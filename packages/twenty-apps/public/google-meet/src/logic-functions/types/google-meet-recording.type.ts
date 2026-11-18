export type GoogleMeetRecording = {
  name: string;
  state?: 'STATE_UNSPECIFIED' | 'STARTED' | 'ENDED' | 'FILE_GENERATED';
  startTime?: string;
  endTime?: string;
  driveDestination?: { file?: string; exportUri?: string };
};
