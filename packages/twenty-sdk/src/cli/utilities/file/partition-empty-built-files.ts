import { type FileToUpload } from '@/cli/utilities/file/file-uploader';
import { statSync } from 'node:fs';
import { join } from 'node:path';
import { FileFolder } from 'twenty-shared/types';

const EMPTY_FILE_SKIPPABLE_FOLDERS = new Set<FileFolder>([
  FileFolder.Dependencies,
]);

export const formatSkippedEmptyFile = (builtPath: string): string =>
  `Skipped ${builtPath}: the built file is empty`;

export const partitionEmptyBuiltFiles = <TFile extends FileToUpload>({
  appPath,
  files,
}: {
  appPath: string;
  files: TFile[];
}): { filesToUpload: TFile[]; skippedFiles: TFile[] } => {
  const filesToUpload: TFile[] = [];
  const skippedFiles: TFile[] = [];

  for (const file of files) {
    const isSkippable =
      EMPTY_FILE_SKIPPABLE_FOLDERS.has(file.fileFolder) &&
      statSync(join(appPath, file.builtPath)).size === 0;

    (isSkippable ? skippedFiles : filesToUpload).push(file);
  }

  return { filesToUpload, skippedFiles };
};
