// checksum is the backend's version identity (an S3 ETag); without it callers lose the precondition.
export type FileStorageMetadata = { size: number; checksum?: string };
