import { type RecordExportRequester } from 'src/engine/core-modules/record-export/types/record-export-requester.type';
import { type FileTokenJwtPayload } from 'src/engine/core-modules/auth/types/file-token-jwt-payload.type';
import { type RecordExport } from 'src/engine/core-modules/record-export/types/record-export.type';

export type RecordExportDownloadTokenJwtPayload = FileTokenJwtPayload &
  RecordExportRequester &
  Pick<RecordExport, 'requestTokenHash' | 'permissionsHash' | 'filename'> & {
    purpose: 'record-export';
  };
