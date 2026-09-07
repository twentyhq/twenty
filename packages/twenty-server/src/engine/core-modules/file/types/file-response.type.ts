import { type Readable } from 'stream';

import { type ContentRange } from 'src/engine/core-modules/file/types/content-range.type';

export type FileResponse =
  | { type: 'redirect'; presignedUrl: string }
  | {
      type: 'stream';
      stream: Readable;
      mimeType: string;
      contentRange?: ContentRange;
    };
