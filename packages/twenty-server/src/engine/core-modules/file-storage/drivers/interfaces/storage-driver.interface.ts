import { type Readable } from 'stream';

export interface StorageDriver {
  readFile(params: { filePath: string }): Promise<Readable>;
  writeFile(params: {
    filePath: string;
    sourceFile: Buffer | Uint8Array | string;
    mimeType: string | undefined;
  }): Promise<void>;

  writeFileStream(params: {
    filePath: string;
    stream: Readable;
    mimeType: string | undefined;
  }): Promise<void>;

  getFileMetadata(params: {
    filePath: string;
  }): Promise<{ size: number } | null>;

  downloadFolder(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void>;
  uploadFolder(params: {
    localPath: string;
    onStoragePath: string;
  }): Promise<void>;

  downloadFile(params: {
    onStoragePath: string;
    localPath: string;
  }): Promise<void>;

  delete(params: { folderPath: string; filename?: string }): Promise<void>;
  move(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void>;
  copy(params: {
    from: { folderPath: string; filename?: string };
    to: { folderPath: string; filename?: string };
  }): Promise<void>;

  checkFileExists(params: { filePath: string }): Promise<boolean>;
  checkFolderExists(params: { folderPath: string }): Promise<boolean>;

  getPresignedUrl(params: {
    filePath: string;
    expiresInSeconds?: number;
    responseContentType?: string;
    responseContentDisposition?: string;
    responseCacheControl?: string;
  }): Promise<string | null>;

  getPresignedUploadUrl(params: {
    filePath: string;
    contentType: string;
    contentLength: number;
    expiresInSeconds?: number;
  }): Promise<string | null>;
}
