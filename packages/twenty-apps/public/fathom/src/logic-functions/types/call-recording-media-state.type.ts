import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';

export type CallRecordingMediaState = {
  id: string;
  updatedAt: string;
  externalRecordingId: string | undefined;
  hasVideo: boolean;
  hasAudio: boolean;
  hasTranscript: boolean;
  hasSummary: boolean;
  failureReason: string | undefined;
  connectedAccountId: string | undefined;
  downloadId: string | undefined;
  uploadCheckpoint: FathomMediaUploadCheckpoint | undefined;
};
