// Direct uploads land under this prefix and are only moved to their final
// path once completeFileUpload has validated them. A presigned PUT URL stays
// usable until it expires, so a client allowed to write straight to the final
// path could swap the bytes after they were checked.
export const PENDING_UPLOAD_PATH_PREFIX = '.pending';
