import { type Readable } from 'stream';

import { type Sources } from 'twenty-shared/types';

export interface StorageDriver {
  delete(params: { folderPath: string; filename?: string }): Promise<void>;
  read(params: { folderPath: string; filename: string }): Promise<Readable>;
  readFolder(folderPath: string): Promise<Sources>;
  write(params: {
    file: Buffer | Uint8Array | string;
    name: string;
    folder: string;
    mimeType: string | undefined;
  }): Promise<void>;
  writeFolder(sources: Sources, folderPath: string): Promise<void>;
  move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void>;
  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void>;
  download(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void>;

  checkFileExists(params: {
    folderPath: string;
    filename: string;
  }): Promise<boolean>;
  checkFolderExists(folderPath: string): Promise<boolean>;
}
