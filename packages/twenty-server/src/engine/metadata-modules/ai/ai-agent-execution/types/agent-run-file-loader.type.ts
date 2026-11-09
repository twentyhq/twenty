import { type FileEntity } from 'src/engine/core-modules/file/entities/file.entity';

export type AgentRunFileLoader = {
  loadFile: (url: string) => Promise<FileEntity | null>;
  loadFileBytes: (url: string) => Promise<Buffer | null>;
  getLoadedFileBytes: (url: string) => Promise<Buffer | null | undefined>;
};
