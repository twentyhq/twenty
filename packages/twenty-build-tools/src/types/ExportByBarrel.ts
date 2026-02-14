import { type FileExports } from './FileExports';

export type ExportByBarrel = {
  barrel: {
    moduleName: string;
    moduleDirectory: string;
  };
  allFileExports: FileExports;
};
