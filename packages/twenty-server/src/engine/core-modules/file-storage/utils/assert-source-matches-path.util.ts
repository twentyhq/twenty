import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';

// Last-resort magic-byte assertion for FileStorageService.writeFile. String
// sources are skipped because they only come from trusted internal code that
// builds the content itself (package.json, yarn.lock, built JS/TS outputs).
export const assertSourceMatchesPath = async ({
  sourceFile,
  resourcePath,
}: {
  sourceFile: Buffer | Uint8Array | string;
  resourcePath: string;
}): Promise<void> => {
  if (typeof sourceFile === 'string') {
    return;
  }

  const buffer = Buffer.isBuffer(sourceFile)
    ? sourceFile
    : Buffer.from(sourceFile);

  await extractFileInfo({
    file: buffer,
    filename: resourcePath,
  });
};
