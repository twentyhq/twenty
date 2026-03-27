import { type Readable } from 'stream';

export type FileResponse =
  | { type: 'redirect'; presignedUrl: string }
  | { type: 'stream'; stream: Readable; mimeType: string };
