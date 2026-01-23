import FileType from 'file-type';

import { extractFileInfo } from 'src/engine/core-modules/file/utils/extract-file-info.utils';

jest.mock('file-type', () => ({
  fromBuffer: jest.fn(),
}));

describe('extractFileInfo', () => {
  const mockBuffer = Buffer.from('test content');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should use detected file type when available', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue({
      mime: 'image/png',
      ext: 'png',
    });

    const result = await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: 'text/plain',
      filename: 'test.txt',
    });

    expect(result).toEqual({
      mimeType: 'image/png',
      ext: 'png',
    });
  });

  it('should fall back to declared values when file type is not detected', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue(undefined);

    const result = await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: 'text/plain',
      filename: 'test.txt',
    });

    expect(result).toEqual({
      mimeType: 'text/plain',
      ext: 'txt',
    });
  });

  it('should handle missing declared mime type when file type is detected', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue({
      mime: 'application/pdf',
      ext: 'pdf',
    });

    const result = await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: undefined,
      filename: 'document',
    });

    expect(result).toEqual({
      mimeType: 'application/pdf',
      ext: 'pdf',
    });
  });

  it('should handle both mime type and extension being undefined', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue(undefined);

    const result = await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: undefined,
      filename: 'file-without-extension',
    });

    expect(result).toEqual({
      mimeType: undefined,
      ext: '',
    });
  });

  it('should handle filenames with multiple dots', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue(undefined);

    const result = await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: 'application/gzip',
      filename: 'archive.tar.gz',
    });

    expect(result).toEqual({
      mimeType: 'application/gzip',
      ext: 'gz',
    });
  });

  it('should call FileType.fromBuffer with the provided buffer', async () => {
    (FileType.fromBuffer as jest.Mock).mockResolvedValue(undefined);

    await extractFileInfo({
      file: mockBuffer,
      declaredMimeType: 'image/png',
      filename: 'image.png',
    });

    expect(FileType.fromBuffer).toHaveBeenCalledWith(mockBuffer);
  });
});
