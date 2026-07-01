// Stable, queryable marker written to callRecorderFailureReason when an artifact is
// skipped for exceeding CALL_RECORDER_MAX_MEDIA_MEGABYTES. The per-artifact size and
// name are emitted on the media-ingestion skip log line, not in this field.
export const CALL_RECORDER_MEDIA_TOO_LARGE_FAILURE_REASON =
  'recording_media_too_large';
