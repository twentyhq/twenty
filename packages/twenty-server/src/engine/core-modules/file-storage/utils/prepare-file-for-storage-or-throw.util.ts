import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

export const prepareFileForStorageOrThrow = async ({
  sourceFile,
  resourcePath,
}: {
  sourceFile: Buffer | Uint8Array | string;
  resourcePath: string;
}): Promise<{
  sourceFile: Buffer | Uint8Array | string;
  mimeType: string;
}> => {
  const bufferForExtract =
    typeof sourceFile === 'string'
      ? Buffer.from(sourceFile, 'utf8')
      : Buffer.isBuffer(sourceFile)
        ? sourceFile
        : Buffer.from(sourceFile);

  const { mimeType, ext } = await extractFileInfoOrThrow({
    file: bufferForExtract,
    filename: resourcePath,
  });

  const sanitizedSourceFile = sanitizeFile({
    file: sourceFile,
    ext,
    mimeType,
  });

  return { sourceFile: sanitizedSourceFile, mimeType };
};
