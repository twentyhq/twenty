import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';

// Mock detectableMimeTypes to work around ESM/CommonJS interop issues in Jest
jest.mock('file-type', () => {
  const actual = jest.requireActual('file-type');

  return {
    ...actual,
    mimeTypes: actual.mimeTypes,
  };
});

describe('extractFileInfo', () => {
  // Real PNG file header (magic numbers)
  const pngBuffer = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00, 0x00, 0x00, 0x0d,
    0x49, 0x48, 0x44, 0x52,
  ]);

  // Real PDF file header
  const pdfBuffer = Buffer.from('%PDF-1.4\n', 'utf-8');

  // Plain text buffer (no magic numbers)
  const textBuffer = Buffer.from('Hello, world!', 'utf-8');

  // Real ZIP file header (for testing docx, xlsx, etc.)
  const zipBuffer = Buffer.from([0x50, 0x4b, 0x03, 0x04]);

  it('should detect PNG from buffer magic numbers', async () => {
    const result = await extractFileInfo({
      file: pngBuffer,
      filename: 'image.png',
    });

    expect(result).toEqual({
      mimeType: 'image/png',
      ext: 'png',
    });
  });

  it('should detect PDF from buffer magic numbers', async () => {
    const result = await extractFileInfo({
      file: pdfBuffer,
      filename: 'document.pdf',
    });

    expect(result).toEqual({
      mimeType: 'application/pdf',
      ext: 'pdf',
    });
  });

  it('should use extension-based lookup for text files', async () => {
    const result = await extractFileInfo({
      file: textBuffer,
      filename: 'document.txt',
    });

    expect(result).toEqual({
      mimeType: 'text/plain',
      ext: 'txt',
    });
  });

  it('should handle CSV files using extension', async () => {
    const result = await extractFileInfo({
      file: textBuffer,
      filename: 'data.csv',
    });

    expect(result).toEqual({
      mimeType: 'text/csv',
      ext: 'csv',
    });
  });

  it('should handle JSON files using extension', async () => {
    const result = await extractFileInfo({
      file: Buffer.from('{"key": "value"}'),
      filename: 'config.json',
    });

    expect(result).toEqual({
      mimeType: 'application/json',
      ext: 'json',
    });
  });

  it('should return application/octet-stream for unknown extensions', async () => {
    const result = await extractFileInfo({
      file: textBuffer,
      filename: 'file.unknown',
    });

    expect(result).toEqual({
      mimeType: 'application/octet-stream',
      ext: 'unknown',
    });
  });

  it('should return application/octet-stream for files without extension', async () => {
    const result = await extractFileInfo({
      file: textBuffer,
      filename: 'file-without-extension',
    });

    expect(result).toEqual({
      mimeType: 'application/octet-stream',
      ext: '',
    });
  });

  it('should detect ZIP files from buffer', async () => {
    const result = await extractFileInfo({
      file: zipBuffer,
      filename: 'archive.zip',
    });

    expect(result).toEqual({
      mimeType: 'application/zip',
      ext: 'zip',
    });
  });

  it('should throw error when PNG extension is used with non-PNG buffer', async () => {
    await expect(
      extractFileInfo({
        file: textBuffer,
        filename: 'fake-image.png',
      }),
    ).rejects.toThrow(
      "File content does not match its extension. The file has extension 'png' (expected mime type: image/png), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.",
    );
  });

  it('should throw error when PDF extension is used with non-PDF buffer', async () => {
    await expect(
      extractFileInfo({
        file: textBuffer,
        filename: 'fake-document.pdf',
      }),
    ).rejects.toThrow(
      "File content does not match its extension. The file has extension 'pdf' (expected mime type: application/pdf), but the file content could not be detected as this type. The file may be corrupted, have the wrong extension, or be a security risk.",
    );
  });

  it('should handle markdown files using extension', async () => {
    const result = await extractFileInfo({
      file: Buffer.from('# Heading\n\nContent'),
      filename: 'README.md',
    });

    expect(result).toEqual({
      mimeType: 'text/markdown',
      ext: 'md',
    });
  });

  it('should handle HTML files using extension', async () => {
    const result = await extractFileInfo({
      file: Buffer.from('<html><body>Test</body></html>'),
      filename: 'index.html',
    });

    expect(result).toEqual({
      mimeType: 'text/html',
      ext: 'html',
    });
  });

  it('should prefer detected type over declared extension', async () => {
    const result = await extractFileInfo({
      file: pngBuffer,
      filename: 'image.txt',
    });

    expect(result).toEqual({
      mimeType: 'image/png',
      ext: 'png',
    });
  });
});
