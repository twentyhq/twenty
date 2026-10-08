import { type FathomMediaUploadCheckpoint } from 'src/logic-functions/types/fathom-media-upload-checkpoint.type';

export type FathomRecordingImportFields = {
  callRecordingId?: string;
  recordingId?: string;
  connectedAccountId?: string;
  mediaDownloadId?: string | null;
  mediaFailureReason?: string | null;
  mediaImportClaimedAt?: string | null;
  mediaUploadCheckpoint?: FathomMediaUploadCheckpoint | null;
};
