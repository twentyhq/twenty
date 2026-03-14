import { FileTypeParser } from 'file-type';

import { extractFileInfo } from '../extract-file-info.utils';

const pngBuffer = Buffer.from([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d, 0x49,
  0x48, 0x44, 0x52,
]);
const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');
const textBuffer = Buffer.from('Hello, world!', 'utf-8');
const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

describe('extractFileInfo', () => {
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
      const result = await extractFileInfo({ file: buffer, filename });

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
      const result = await extractFileInfo({ file: textBuffer, filename });

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
        extractFileInfo({ file: textBuffer, filename }),
      ).rejects.toThrow(
        `File content does not match its extension. The file has extension '${ext}' (expected mime type: ${expectedMime}), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.`,
      );
    },
  );

  it('should not crash when file-type detection throws an internal error', async () => {
    jest
      .spyOn(FileTypeParser.prototype, 'fromBuffer')
      .mockRejectedValueOnce(new Error('Unclosed root tag'));

    const result = await extractFileInfo({
      file: textBuffer,
      filename: 'notes.txt',
    });

    expect(result).toEqual({ mimeType: 'text/plain', ext: 'txt' });
  });

  it('should throw FileStorageException instead of internal error when detection fails for supported type', async () => {
    jest
      .spyOn(FileTypeParser.prototype, 'fromBuffer')
      .mockRejectedValueOnce(new Error('Unclosed root tag'));

    await expect(
      extractFileInfo({ file: pdfBuffer, filename: 'document.pdf' }),
    ).rejects.toThrow('File content does not match its extension');
  });
});
