import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { OUTPUT_DIR } from 'twenty-shared/application';

import { copyBuildFile } from '@/app/bundles/copy-build-file';
import { recordWatchFile } from '@/app/dev/collect-watch-inputs';
import { ensureDir } from '@/app/fs-utils';

const README_FILE_NAME_REGEX = /^readme(\.[^.]+)?$/i;

export const findReadmeFileName = (entries: string[]): string | undefined => {
  const readmeFileNames = entries.filter((entry) =>
    README_FILE_NAME_REGEX.test(entry),
  );

  return (
    readmeFileNames.find((entry) => /\.md$/i.test(entry)) ?? readmeFileNames[0]
  );
};

export const copyReadmeToOutput = async ({
  appPath,
  relativeOutputDir = OUTPUT_DIR,
  dereferenceSymlinks = false,
}: {
  appPath: string;
  relativeOutputDir?: string;
  dereferenceSymlinks?: boolean;
}): Promise<void> => {
  const readmeFileName = findReadmeFileName(await readdir(appPath));

  if (readmeFileName === undefined) {
    return;
  }

  const outputDir = join(appPath, relativeOutputDir);

  await ensureDir(outputDir);
  const sourcePath = join(appPath, readmeFileName);
  const destinationPath = join(outputDir, readmeFileName);

  recordWatchFile(sourcePath);

  await copyBuildFile({ sourcePath, destinationPath, dereferenceSymlinks });
};
