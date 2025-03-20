import { promises as fs } from 'fs';
import { join } from 'path';

type renameJsToExtArgs = {
  directory: string;
  extension: string;
};

const renameJsToExt = async ({ directory, extension }: renameJsToExtArgs) => {
  const entries = await fs.readdir(directory, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(directory, entry.name);

    if (entry.isDirectory()) {
      await renameJsToExt({ directory: fullPath, extension });
      continue;
    }

    if (!entry.isFile()) {
      continue;
    }

    const isJsFile = entry.name.endsWith('.js');
    const isJsMapFile = entry.name.endsWith('.js.map');
    if (isJsFile || isJsMapFile) {
      const newPath = fullPath.replace(/\.js(\.map)?$/, `.${extension}$1`);
      await fs.rename(fullPath, newPath);
    }
  }
};

const main = async () => {
  try {
    const directory = process.argv[2];
    const extension = process.argv[3];
    if (!directory || !extension) {
      // eslint-disable-next-line no-console
      console.error('Please provide a directory and an extension');
      process.exit(1);
    }

    await renameJsToExt({ directory, extension });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Top-level error:', error);
    process.exit(1);
  }
};
main();
