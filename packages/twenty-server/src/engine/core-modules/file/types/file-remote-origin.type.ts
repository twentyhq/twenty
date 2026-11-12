import { type FileRemoteOriginType } from 'src/engine/core-modules/file/types/file-remote-origin-type.type';

export type FileRemoteOrigin = {
  originType: FileRemoteOriginType;
  originId: string;
  originKey?: string;
};
