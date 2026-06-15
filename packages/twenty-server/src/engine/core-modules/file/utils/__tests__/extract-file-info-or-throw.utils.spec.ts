import { FileTypeParser } from 'file-type';

import { extractFileInfoOrThrow } from '../extract-file-info-or-throw.utils';

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');
const textBuffer = Buffer.from('Hello, world!', 'utf-8');
const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

describe('extractFileInfoOrThrow', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    {
      name: 'PNG',
      buffer: pngBuffer,
      filename: 'image.png',
      ext: 'png',
      mime: 'image/png',
    },
    {
      name: 'PDF',
      buffer: pdfBuffer,
      filename: 'document.pdf',
      ext: 'pdf',
      mime: 'application/pdf',
    },
    {
      name: 'ZIP',
      buffer: zipBuffer,
      filename: 'archive.zip',
      ext: 'zip',
      mime: 'application/zip',
    },
    {
      name: 'PNG (mismatched extension)',
      buffer: pngBuffer,
      filename: 'image.txt',
      ext: 'png',
      mime: 'image/png',
    },
  ])(
    'should detect $name from buffer magic numbers',
    async ({ buffer, filename, ext, mime }) => {
      const result = await extractFileInfoOrThrow({ file: buffer, filename });

      expect(result).toEqual({ mimeType: mime, ext });
    },
  );

  it.each([
    { name: 'text', filename: 'document.txt', ext: 'txt', mime: 'text/plain' },
    { name: 'CSV', filename: 'data.csv', ext: 'csv', mime: 'text/csv' },
    {
      name: 'JSON',
      filename: 'config.json',
      ext: 'json',
      mime: 'application/json',
    },
    {
      name: 'markdown',
      filename: 'README.md',
      ext: 'md',
      mime: 'text/markdown',
    },
    { name: 'HTML', filename: 'index.html', ext: 'html', mime: 'text/html' },
    {
      name: 'unknown extension',
      filename: 'file.unknown',
      ext: 'unknown',
      mime: 'application/octet-stream',
    },
    {
      name: 'no extension',
      filename: 'file-without-extension',
      ext: '',
      mime: 'application/octet-stream',
    },
  ])(
    'should fall back to extension for $name files',
    async ({ filename, ext, mime }) => {
      const result = await extractFileInfoOrThrow({
        file: textBuffer,
        filename,
      });

      expect(result).toEqual({ mimeType: mime, ext });
    },
  );

  it.each([
    { ext: 'png', filename: 'fake-image.png', expectedMime: 'image/png' },
    {
      ext: 'pdf',
      filename: 'fake-document.pdf',
      expectedMime: 'application/pdf',
    },
  ])(
    'should throw when $ext extension does not match buffer content',
    async ({ filename, ext, expectedMime }) => {
      await expect(
        extractFileInfoOrThrow({ file: textBuffer, filename }),
      ).rejects.toThrow(
        `File content does not match its extension. The file has extension '${ext}' (expected mime type: ${expectedMime}), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.`,
      );
    },
  );

  describe('TWENTY_MIME_POLICY (Twenty deviates from IANA)', () => {
    it.each([
      { filename: 'src/index.ts', expectedMime: 'application/typescript' },
      { filename: 'src/index.tsx', expectedMime: 'application/typescript' },
    ])(
      'should return $expectedMime for $filename without throwing on IANA collision',
      async ({ filename, expectedMime }) => {
        const result = await extractFileInfoOrThrow({
          file: textBuffer,
          filename,
        });

        expect(result.mimeType).toBe(expectedMime);
      },
    );
  });

  describe('when file-type parser throws', () => {
    it('should throw FileStorageException', async () => {
      jest
        .spyOn(FileTypeParser.prototype, 'fromBuffer')
        .mockRejectedValue(new Error('Non-whitespace before first tag.'));

      await expect(
        extractFileInfoOrThrow({
          file: pdfBuffer,
          filename: 'test.pdf',
        }),
      ).rejects.toThrow(
        /File content detection failed: Non-whitespace before first tag./,
      );
    });
  });
});
