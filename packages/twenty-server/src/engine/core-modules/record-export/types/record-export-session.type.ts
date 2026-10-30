import { type RecordExportRequester } from 'src/engine/core-modules/record-export/types/record-export-requester.type';

export type RecordExportSession = RecordExportRequester & {
  requestTokenHash: string;
};
