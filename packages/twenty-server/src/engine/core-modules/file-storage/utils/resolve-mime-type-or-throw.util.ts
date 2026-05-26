import { extractFileInfoOrThrow } from 'src/engine/core-modules/file/utils/extract-file-info-or-throw.utils';

// Resolves the mime type that should be persisted and served for a writeFile
// call. All sources — Buffer, Uint8Array, or string — are routed through the
// same byte-aware pipeline (extractFileInfoOrThrow), which:
//   1. attempts magic-byte detection via file-type and returns the detected
//      mime when bytes match a known signature,
//   2. otherwise falls back to TWENTY_MIME_POLICY by extension,
//   3. otherwise falls back to mrmime by extension,
//   4. otherwise returns application/octet-stream.
//
// The function throws FileStorageException(INVALID_EXTENSION) when the
// declared extension maps to a binary mime that file-type is supposed to
// recognize but the bytes were not detected as that type.
//
// String sources are converted to UTF-8 buffers before validation. file-type
// has no detector for text formats, so well-formed text content flows through
// the extension-based branches unchanged; pathological cases (e.g. raw binary
// bytes accidentally stringified) are caught the same way as buffer sources.
export const resolveMimeTypeOrThrow = async ({
  sourceFile,
  resourcePath,
}: {
  sourceFile: Buffer | Uint8Array | string;
  resourcePath: string;
}): Promise<string> => {
  const buffer =
    typeof sourceFile === 'string'
      ? Buffer.from(sourceFile, 'utf8')
      : Buffer.isBuffer(sourceFile)
        ? sourceFile
        : Buffer.from(sourceFile);

  const { mimeType } = await extractFileInfoOrThrow({
    file: buffer,
    filename: resourcePath,
  });

  return mimeType;
};
