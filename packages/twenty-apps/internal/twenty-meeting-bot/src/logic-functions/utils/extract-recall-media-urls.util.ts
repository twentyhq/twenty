export type RecallMediaUrls = {
  videoUrl: string | undefined;
  audioUrl: string | undefined;
};

// Pre-signed URLs expire within hours; always re-extract from a fresh GET /bot.
export const extractRecallMediaUrls = (
  bot: Record<string, unknown>,
): RecallMediaUrls => {
  const mediaShortcuts = extractFirstRecordingMediaShortcuts(bot);

  return {
    videoUrl: getString(
      getRecordAtPath(mediaShortcuts, ['video_mixed', 'data', 'download_url']),
    ),
    audioUrl: getString(
      getRecordAtPath(mediaShortcuts, ['audio_mixed', 'data', 'download_url']),
    ),
  };
};

const extractFirstRecordingMediaShortcuts = (
  bot: Record<string, unknown>,
): Record<string, unknown> | undefined => {
  if (!Array.isArray(bot.recordings)) {
    return undefined;
  }

  return asRecord(asRecord(bot.recordings[0])?.media_shortcuts);
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : undefined;

const getString = (value: unknown): string | undefined =>
  typeof value === 'string' && value.trim() !== '' ? value : undefined;

const getRecordAtPath = (
  record: Record<string, unknown> | undefined,
  path: string[],
): unknown =>
  path.reduce<unknown>(
    (currentValue, pathPart) => asRecord(currentValue)?.[pathPart],
    record,
  );
