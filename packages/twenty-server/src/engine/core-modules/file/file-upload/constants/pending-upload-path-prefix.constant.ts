// A presigned PUT stays usable until expiry, so uploads land here and move only once completeFileUpload validates them.
export const PENDING_UPLOAD_PATH_PREFIX = '.pending';
