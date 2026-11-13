import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type AgentRunFileLoader = {
  loadFile: (url: string) => Promise<FileEntity | null>;
  loadFileBytes: (url: string) => Promise<Buffer | null>;
  getFileIdOfBytes: (fileBytes: Uint8Array) => string | undefined;
  isFileUnreadable: (url: string) => boolean;
};
