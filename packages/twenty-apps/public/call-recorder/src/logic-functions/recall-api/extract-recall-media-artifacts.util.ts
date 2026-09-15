import { normalizeRecallTimestamp } from 'src/logic-functions/recall-api/normalize-recall-timestamp.util';
import { asRecord } from 'src/logic-functions/utils/as-record.util';
import { getRecordAtPath } from 'src/logic-functions/utils/get-record-at-path.util';
import { getString } from 'src/logic-functions/utils/get-string.util';

export type RecallMediaArtifact = {
  downloadUrl: string | undefined;
  statusCode: string | undefined;
};

export type RecallMediaArtifacts = {
  video: RecallMediaArtifact;
  audio: RecallMediaArtifact;
  expiresAt: string | undefined;
};

// Pre-signed URLs expire within hours; always re-extract from a fresh GET /recording.
export const extractRecallMediaArtifacts = (
  recording: Record<string, unknown>,
): RecallMediaArtifacts => {
  const mediaShortcuts = asRecord(recording.media_shortcuts);

  return {
    video: extractArtifact(mediaShortcuts, 'video_mixed'),
    audio: extractArtifact(mediaShortcuts, 'audio_mixed'),
    expiresAt: normalizeRecallTimestamp(getString(recording.expires_at)),
  };
};

// v1.11 exposes download_url flat on the artifact; older artifacts nest it under data.
const extractArtifact = (
  mediaShortcuts: Record<string, unknown> | undefined,
  artifactKey: string,
): RecallMediaArtifact => ({
  downloadUrl:
    getString(getRecordAtPath(mediaShortcuts, [artifactKey, 'download_url'])) ??
    getString(
      getRecordAtPath(mediaShortcuts, [artifactKey, 'data', 'download_url']),
    ),
  statusCode: getString(
    getRecordAtPath(mediaShortcuts, [artifactKey, 'status', 'code']),
  ),
});
