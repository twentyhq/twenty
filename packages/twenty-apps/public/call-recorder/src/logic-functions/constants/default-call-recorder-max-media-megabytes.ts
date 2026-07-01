// Artifacts are buffered whole in memory to upload (download copy + Blob copy in
// uploadFile), so a single file near this size can OOM-kill the 512MB executor
// Lambda. Keep the default conservatively below that ceiling until media transfer
// streams instead of buffering. Tune via CALL_RECORDER_MAX_MEDIA_MEGABYTES.
export const DEFAULT_CALL_RECORDER_MAX_MEDIA_MEGABYTES = 75;
