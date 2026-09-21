import { type ByteRange } from 'src/engine/core-modules/file-storage/types/byte-range.type';

export type ContentRange = ByteRange & {
  fileSizeInBytes: number;
};
