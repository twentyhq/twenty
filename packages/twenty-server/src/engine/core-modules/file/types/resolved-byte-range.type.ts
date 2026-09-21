import { type ByteRange } from 'src/engine/core-modules/file-storage/types/byte-range.type';

export type ResolvedByteRange =
  | { type: 'full' }
  | { type: 'partial'; byteRange: ByteRange }
  | { type: 'unsatisfiable' };
