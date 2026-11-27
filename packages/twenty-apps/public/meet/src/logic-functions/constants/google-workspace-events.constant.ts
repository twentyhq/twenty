export const GOOGLE_WORKSPACE_EVENTS_API_BASE_URL =
  'https://workspaceevents.googleapis.com/v1';
export const MEET_TRANSCRIPT_GENERATED_EVENT_TYPE =
  'google.workspace.meet.transcript.v2.fileGenerated';
export const MEET_SMART_NOTE_GENERATED_EVENT_TYPE =
  'google.workspace.meet.smartNote.v2.fileGenerated';
export const MEET_RECORDING_GENERATED_EVENT_TYPE =
  'google.workspace.meet.recording.v2.fileGenerated';
export const MEET_EVENT_TYPES = [
  MEET_TRANSCRIPT_GENERATED_EVENT_TYPE,
  MEET_SMART_NOTE_GENERATED_EVENT_TYPE,
  MEET_RECORDING_GENERATED_EVENT_TYPE,
];
export const GOOGLE_WORKSPACE_EVENTS_OPERATION_MAX_POLLS = 5;
export const GOOGLE_WORKSPACE_EVENTS_OPERATION_POLL_DELAY_MILLISECONDS = 1000;
export const GOOGLE_WORKSPACE_EVENTS_SOURCE_PREFIX =
  '//workspaceevents.googleapis.com/';
