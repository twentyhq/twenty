import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';
import { sanitizeFile } from 'src/engine/core-modules/file/utils/sanitize-file.utils';

// Single prep step that every writeFile call runs before persisting.
//
// 1. Routes the source through extractFileInfoOrThrow (magic-byte sniffing,
//    TWENTY_MIME_POLICY, then mrmime) to derive the authoritative mime and
//    extension. Throws FileStorageException(INVALID_EXTENSION) when bytes
//    contradict a binary path extension.
// 2. Sanitizes the source content (currently DOMPurify on SVG; no-op for
//    anything else). Sanitization is enforced here so callers cannot skip it.
//
// Returning both the sanitized source and the resolved mime keeps the
// extract pass single-shot — FileStorageService consumes both directly.
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
