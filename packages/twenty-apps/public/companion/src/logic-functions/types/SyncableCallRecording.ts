import { type FilesFieldValue } from 'src/logic-functions/types/FilesFieldValue';

export type SyncableCallRecording = {
  companionSession?: unknown;
  id: string;
  status: string | undefined;
  startedAt: string | undefined;
  endedAt: string | undefined;
  externalRecordingId: string | undefined;
  companionFailureReason: string | undefined;
  transcript: unknown;
  audio: FilesFieldValue | undefined;
  video: FilesFieldValue | undefined;
};
