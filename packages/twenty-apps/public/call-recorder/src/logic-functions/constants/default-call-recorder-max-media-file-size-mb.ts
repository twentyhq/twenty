// Media ingestion buffers a file once for download and again for upload, so the
// peak memory is a multiple of the file size; 80 MB keeps the observed ~4x peak
// within the logic function memory budget.
export const DEFAULT_CALL_RECORDER_MAX_MEDIA_FILE_SIZE_MB = 80;
