import fs from 'fs';

import archiver from 'archiver';

export const createZipFile = async (sourceDir, outPath): Promise<void> => {
  const output = fs.createWriteStream(outPath);
  const archive = archiver('zip', {
    zlib: { level: 9 }, // Compression level
  });

  return new Promise((resolve, reject) => {
    output.on('close', () => resolve());
    archive.on('error', (err) => reject(err));
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
};
