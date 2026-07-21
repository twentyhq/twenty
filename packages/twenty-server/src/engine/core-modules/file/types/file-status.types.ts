export const FILE_STATUS = {
  // File record exists but bytes have not been confirmed in storage yet
  // (direct upload initiated, waiting for the client to upload and confirm).
  PENDING: 'PENDING',
  UPLOADED: 'UPLOADED',
} as const;

export type FileStatus = (typeof FILE_STATUS)[keyof typeof FILE_STATUS];
