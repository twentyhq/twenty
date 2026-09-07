import { type FathomMediaKind } from 'src/logic-functions/schemas/fathom-media-kind.schema';

export type FathomMediaUploadCheckpoint = {
  downloadId: string;
  fileId: string;
  kind: FathomMediaKind;
};
