import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';

export type RecordExportDownloadTokenJwtPayload = FileTokenJwtPayload & {
  purpose: 'record-export';
  userWorkspaceId: string;
};
