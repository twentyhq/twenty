import { FileFolder } from 'twenty-shared/types';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-url.util';

describe('extractFileIdFromUrl', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('should extract valid UUID from URL with matching file folder', () => {
    const url = `https://example.com/${FileFolder.FilesField}/${validUuid}`;

    expect(extractFileIdFromUrl(url, FileFolder.FilesField)).toBe(validUuid);
  });

  it('should return null for invalid URL', () => {
    expect(extractFileIdFromUrl('not-a-valid-url', FileFolder.FilesField)).toBe(
      null,
    );
  });

  it('should return null for external link with different path', () => {
    const url = `https://example.com/external-path/${validUuid}`;

    expect(extractFileIdFromUrl(url, FileFolder.FilesField)).toBe(null);
  });

  it('should return null when fileId is not a valid UUID', () => {
    const url = `https://example.com/${FileFolder.FilesField}/not-a-uuid`;

    expect(extractFileIdFromUrl(url, FileFolder.FilesField)).toBe(null);
  });

  it('should return null when pathname has no fileId segment', () => {
    const url = `https://example.com/${FileFolder.FilesField}/`;

    expect(extractFileIdFromUrl(url, FileFolder.FilesField)).toBe(null);
  });

  it('should work with different file folders', () => {
    const corePictureUrl = `https://example.com/${FileFolder.CorePicture}/${validUuid}`;

    expect(extractFileIdFromUrl(corePictureUrl, FileFolder.CorePicture)).toBe(
      validUuid,
    );
  });

  it('should return null when file folder does not match', () => {
    const url = `https://example.com/${FileFolder.CorePicture}/${validUuid}`;

    expect(extractFileIdFromUrl(url, FileFolder.FilesField)).toBe(null);
  });
});
