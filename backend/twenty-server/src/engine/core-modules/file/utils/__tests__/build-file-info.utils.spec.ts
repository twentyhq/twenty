import { v4 as uuidV4 } from 'uuid';

import { buildFileInfo } from 'src/engine/core-modules/file/utils/build-file-info.utils';

jest.mock('uuid', () => ({
  v4: jest.fn(),
}));

describe('buildFileInfo', () => {
  const mockId = '1234-uuid';

  beforeEach(() => {
    (uuidV4 as jest.Mock).mockReturnValue(mockId);
  });

  it('should extract extension and generate correct name with extension', () => {
    const result = buildFileInfo('file.txt');

    expect(result).toEqual({
      ext: 'txt',
      name: `${mockId}.txt`,
    });
  });

  it('should handle filenames without extension', () => {
    const result = buildFileInfo('file');

    expect(result).toEqual({
      ext: '',
      name: mockId,
    });
  });

  it('should handle filenames with multiple dots', () => {
    const result = buildFileInfo('archive.tar.gz');

    expect(result).toEqual({
      ext: 'gz',
      name: `${mockId}.gz`,
    });
  });
});
