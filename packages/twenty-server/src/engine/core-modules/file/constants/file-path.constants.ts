import { FileFolder } from 'src/engine/core-modules/file/interfaces/file-folder.interface';

export const FILE_PATH_CONSTANTS = {
  FILES_BASE_PATH: '/files',
  ATTACHMENT_PATH: `${FileFolder.Attachment}`,
  FILES_WITH_TOKEN_PATTERN: new RegExp(
    `/files/${FileFolder.Attachment}/[^/]+/([^/]+)$`,
  ),
  FILES_PATTERN: /\/files\/(.+)$/,
  ATTACHMENT_PATTERN: new RegExp(`${FileFolder.Attachment}/.+`),
} as const;
