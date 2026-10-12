import { type FileFolder } from 'twenty-shared/types';

export type OnFileBuiltCallback = (options: {
  fileFolder: FileFolder;
  builtPath: string;
  sourcePath: string;
  checksum: string;
  usesSdkClient?: boolean;
}) => void | Promise<void>;
