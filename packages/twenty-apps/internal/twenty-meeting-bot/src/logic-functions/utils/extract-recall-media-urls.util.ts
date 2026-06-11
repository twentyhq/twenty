import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecordAtPath } from 'src/logic-functions/utils/get-record-at-path.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export type RecallMediaUrls = {
  videoUrl: string | undefined;
  audioUrl: string | undefined;
};

// Pre-signed URLs expire within hours; always re-extract from a fresh GET /recording.
export const extractRecallMediaUrls = (
  recording: Record<string, unknown>,
): RecallMediaUrls => {
  const mediaShortcuts = asRecord(recording.media_shortcuts);

  return {
    videoUrl: extractArtifactDownloadUrl(mediaShortcuts, 'video_mixed'),
    audioUrl: extractArtifactDownloadUrl(mediaShortcuts, 'audio_mixed'),
  };
};

// v1.11 exposes download_url flat on the artifact; older artifacts nest it under data.
const extractArtifactDownloadUrl = (
  mediaShortcuts: Record<string, unknown> | undefined,
  artifactKey: string,
): string | undefined =>
  getString(getRecordAtPath(mediaShortcuts, [artifactKey, 'download_url'])) ??
  getString(
    getRecordAtPath(mediaShortcuts, [artifactKey, 'data', 'download_url']),
  );
