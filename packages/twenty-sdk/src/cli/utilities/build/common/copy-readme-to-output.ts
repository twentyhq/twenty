import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { OUTPUT_DIR } from 'twenty-shared/application';

import { copy, ensureDir } from '@/cli/utilities/file/fs-utils';

// npm only ships a README when the file lives in the package root, so the
// app's readme has to be copied into the build output that gets published.
const README_FILE_NAME_REGEX = /^readme(\.[^.]+)?$/i;

export const findReadmeFileName = (
  entries: string[],
): string | undefined => {
  const readmeFileNames = entries.filter((entry) =>
    README_FILE_NAME_REGEX.test(entry),
  );

  // Prefer markdown, matching how npm ranks README candidates.
  return (
    readmeFileNames.find((entry) => /\.md$/i.test(entry)) ?? readmeFileNames[0]
  );
};

export const copyReadmeToOutput = async (appPath: string): Promise<void> => {
  const readmeFileName = findReadmeFileName(await readdir(appPath));

  if (readmeFileName === undefined) {
    return;
  }

  const outputDir = join(appPath, OUTPUT_DIR);

  await ensureDir(outputDir);
  await copy(join(appPath, readmeFileName), join(outputDir, readmeFileName));
};
