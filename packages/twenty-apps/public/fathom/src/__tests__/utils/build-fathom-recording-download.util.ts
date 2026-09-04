import {
  type RecordingDownload,
  type RecordingDownloadFile,
} from 'fathom-typescript/sdk/models/shared';

export const buildFathomRecordingDownloadFile = ({
  url = 'https://media.fathom.ai/downloads/recording',
  contentType = 'video/mp4',
  fileSizeBytes = 1_024,
}: Partial<Omit<RecordingDownloadFile, 'expiresAt'>> = {}): RecordingDownloadFile => ({
  url,
  contentType,
  fileSizeBytes,
  expiresAt: new Date('2026-09-05T00:00:00.000Z'),
});

export const buildFathomRecordingDownload = ({
  downloadId = 'dl_test',
  recordingId = 123,
  status = 'completed',
  video,
  audio,
  failureReason,
}: Partial<RecordingDownload> = {}): RecordingDownload => ({
  downloadId,
  recordingId,
  status,
  ...(video === undefined ? {} : { video }),
  ...(audio === undefined ? {} : { audio }),
  ...(failureReason === undefined ? {} : { failureReason }),
});
