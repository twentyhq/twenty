// Persisted in callRecorderFailureReason (comma-joined when both artifacts are
// oversized). The completion gate treats a marked artifact as resolved so the
// recording still completes and bills; the marker also lets a later backfill
// re-ingest the file once uploads stream instead of buffering.
export const VIDEO_FILE_TOO_LARGE_FAILURE_REASON = 'video_file_too_large';
export const AUDIO_FILE_TOO_LARGE_FAILURE_REASON = 'audio_file_too_large';
