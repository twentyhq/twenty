import { type Readable } from 'stream';

import { type FileRemoteOrigin } from 'src/engine/core-modules/file/types/file-remote-origin.type';

export type RemoteFileOriginResolver = {
  fetchRemoteContent(input: {
    workspaceId: string;
    remoteOrigin: FileRemoteOrigin;
  }): Promise<Readable | null>;
};
