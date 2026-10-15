import { type RecordExportSession } from 'src/engine/core-modules/record-export/types/record-export-session.type';
import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';

export type RecordExportDownloadTokenJwtPayload = FileTokenJwtPayload &
  RecordExportSession &
  Pick<RecordExport, 'permissionsHash' | 'filename'> & {
    purpose: 'record-export';
  };
