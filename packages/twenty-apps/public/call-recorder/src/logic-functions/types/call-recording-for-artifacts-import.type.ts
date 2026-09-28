import { type FilesFieldValue } from 'src/logic-functions/types/files-field-value.type';

export type CallRecordingForArtifactsImport = {
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  callRecorderFailureReason: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
  externalBotId: string | undefined;
};
