export const FILE_REMOTE_ORIGIN_TYPE = {
  MESSAGE: 'MESSAGE',
} as const;

export type FileRemoteOriginType =
  (typeof FILE_REMOTE_ORIGIN_TYPE)[keyof typeof FILE_REMOTE_ORIGIN_TYPE];
