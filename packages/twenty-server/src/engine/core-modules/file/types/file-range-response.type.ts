import { type Readable } from 'stream';

import { type ByteRange } from 'src/engine/core-modules/file-storage/types/byte-range.type';
import { type FileResponse } from 'src/engine/core-modules/file/types/file-response.type';

export type FileRangeResponse =
  | FileResponse
  | {
      type: 'partial-stream';
      stream: Readable;
      mimeType: string;
      byteRange: ByteRange;
      fileSizeInBytes: number;
    }
  | { type: 'unsatisfiable-range'; fileSizeInBytes: number };
