import { type CallRecordingArtifactImportScope } from 'src/logic-functions/types/call-recording-artifact-scope.type';

export const CALL_RECORDING_ARTIFACT_IMPORT_SCOPES = [
  'transcript',
  'audio',
  'video',
] satisfies CallRecordingArtifactImportScope[];
