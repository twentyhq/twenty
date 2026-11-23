const MEBIBYTE = 1024 * 1024;

// Fine-grained up to the Lambda driver's 4 MiB cap, to see apps approaching it.
export const SDK_CLIENT_ARCHIVE_SIZE_BUCKET_BOUNDARIES_BYTES = [
  0.25, 0.5, 0.75, 1, 1.5, 2, 2.5, 3, 3.5, 4,
].map((mebibytes) => mebibytes * MEBIBYTE);
