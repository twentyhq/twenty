export const FILE_STORAGE_S3_REQUEST_TIMEOUT_MS = 5 * 60 * 1000;
export const FILE_STORAGE_S3_CONNECTION_TIMEOUT_MS = 30 * 1000;
export const FILE_STORAGE_S3_MAX_SOCKETS = 200;

// HeadObject and the MIME-sniff range read answer in milliseconds when S3 is
// healthy, and the mutation that issues them sits behind a 100s gateway
// timeout. A short budget on a socket pool that streaming downloads cannot
// starve turns a degraded S3 into a fast, explicit error instead of a 504.
export const FILE_STORAGE_S3_METADATA_REQUEST_TIMEOUT_MS = 15 * 1000;
export const FILE_STORAGE_S3_METADATA_CONNECTION_TIMEOUT_MS = 5 * 1000;
export const FILE_STORAGE_S3_METADATA_MAX_ATTEMPTS = 2;
export const FILE_STORAGE_S3_METADATA_MAX_SOCKETS = 50;

export const FILE_STORAGE_S3_SLOW_REQUEST_THRESHOLD_MS = 2 * 1000;
