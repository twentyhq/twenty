import { FileFolder } from 'twenty-shared/types';

import { extractFileIdFromUrl } from 'src/engine/core-modules/file/files-field/utils/extract-file-id-from-Url.util';

describe('extractFileIdFromUrl', () => {
  const validUuid = '550e8400-e29b-41d4-a716-446655440000';

  it('should extract valid UUID from Url with matching file folder', () => {
    const Url = `https://example.com/file/${FileFolder.FilesField}/${validUuid}`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(validUuid);
  });

  it('should return null for invalid Url', () => {
    expect(extractFileIdFromUrl('not-a-valid-Url', FileFolder.FilesField)).toBe(
      null,
    );
  });

  it('should return null for external link with different path', () => {
    const Url = `https://example.com/external-path/${validUuid}`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(null);
  });

  it('should return null when fileId is not a valid UUID', () => {
    const Url = `https://example.com/file/${FileFolder.FilesField}/not-a-uuid`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(null);
  });

  it('should return null when pathname has no fileId segment', () => {
    const Url = `https://example.com/file/${FileFolder.FilesField}/`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(null);
  });

  it('should work with different file folders', () => {
    const corePictureUrl = `https://example.com/file/${FileFolder.CorePicture}/${validUuid}`;

    expect(extractFileIdFromUrl(corePictureUrl, FileFolder.CorePicture)).toBe(
      validUuid,
    );
  });

  it('should work with query params', () => {
    const Url = `http://localhost:3000/file/${FileFolder.FilesField}/${validUuid}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ3b3Jrc3BhY2VJZCI6IjNmZWNhYzJkLWMbOWEtNGExOC1hZjVlLTk0NjYwMTNhODFkMSIsImZpbGVJZCI6IjVlYmJjODQ0LTAzYTUtNGEyNS05NDliLWE2NWNmMjkzMWExOSIsInN1YiI6IjNmZWNhYzJkLWMwOWEtNGExOC1hZjVlLTk0NjYwMTNhODFkMSIsInR5cGUiOiJGSUxFIiwiaWF0IjoxNzcxMjYzNjEwLCJleHAiOjE3NzEzNTAwMTB9.qBy0SvkAuaq-KwWIALasRVJwSkN9Llu15LXUnVZMy-Y`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(validUuid);
  });

  it('should return null when file folder does not match', () => {
    const Url = `https://example.com/file/${FileFolder.CorePicture}/${validUuid}`;

    expect(extractFileIdFromUrl(Url, FileFolder.FilesField)).toBe(null);
  });
});
