import fs from 'fs';
import { pipeline } from 'stream/promises';

// @ts-expect-error legacy noImplicitAny
import archiver from 'archiver';

export const createZipFile = async (
  sourceDir: string,
  outPath: string,
): Promise<void> => {
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Compression level
  });

  const p = pipeline(archive, output);

  archive.directory(sourceDir, false);
  archive.finalize();

  return p;
};
