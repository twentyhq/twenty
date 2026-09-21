// checksum is whatever the backend can offer as a version identity (an S3
// ETag); backends that have none omit it and callers lose the precondition.
export type FileStorageMetadata = { size: number; checksum?: string };
