import { isArray, isObject } from '@sniptt/guards';

import { isNonEmptyString } from 'src/logic-functions/utils/is-non-empty-string.util';

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

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  isObject(value) && !isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown): string | undefined =>
  isNonEmptyString(value) ? value : undefined;

const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
