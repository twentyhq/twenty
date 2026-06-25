import { FileFolder } from 'twenty-shared/types';

import { getContentDisposition } from 'src/engine/core-modules/file/utils/get-content-disposition.utils';
import { setFileResponseHeaders } from 'src/engine/core-modules/file/utils/set-file-response-headers.utils';

const createMockResponse = () => ({
  setHeader: jest.fn(),
});

describe('setFileResponseHeaders', () => {
  it('should set Content-Type from mimeType', () => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, 'image/png');

    expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/png');
  });

  it('should fall back to application/octet-stream for empty mimeType', () => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, '');

    expect(res.setHeader).toHaveBeenCalledWith(
      'Content-Type',
      'application/octet-stream',
    );
  });

  it('should always set X-Content-Type-Options: nosniff', () => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, 'text/html');

    expect(res.setHeader).toHaveBeenCalledWith(
      'X-Content-Type-Options',
      'nosniff',
    );
  });

  it.each([
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'text/plain',
    'video/mp4',
    'audio/mpeg',
  ])('should set Content-Disposition: inline for safe type %s', (mimeType) => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, mimeType);

    expect(res.setHeader).toHaveBeenCalledWith('Content-Disposition', 'inline');
  });

  it.each([
    'text/html',
    'image/svg+xml',
    'application/xml',
    'application/octet-stream',
    'application/javascript',
  ])(
    'should set Content-Disposition: attachment for unsafe type %s',
    (mimeType) => {
      const res = createMockResponse();

      setFileResponseHeaders(res as any, mimeType);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Content-Disposition',
        'attachment',
      );
    },
  );

  it('should not set Cache-Control when no fileFolder is provided', () => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, 'image/png');

    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Cache-Control',
      expect.anything(),
    );
  });

  it.each([
    FileFolder.CorePicture,
    FileFolder.ProfilePicture,
    FileFolder.WorkspaceLogo,
    FileFolder.PersonPicture,
  ])(
    'should set an immutable Cache-Control for picture folder %s',
    (fileFolder) => {
      const res = createMockResponse();

      setFileResponseHeaders(res as any, 'image/png', fileFolder);

      expect(res.setHeader).toHaveBeenCalledWith(
        'Cache-Control',
        'private, max-age=86400, immutable',
      );
    },
  );

  it.each([
    FileFolder.FilesField,
    FileFolder.Attachment,
    FileFolder.Workflow,
    FileFolder.PublicAsset,
  ])('should not set Cache-Control for non-picture folder %s', (fileFolder) => {
    const res = createMockResponse();

    setFileResponseHeaders(res as any, 'image/png', fileFolder);

    expect(res.setHeader).not.toHaveBeenCalledWith(
      'Cache-Control',
      expect.anything(),
    );
  });
});

describe('getContentDisposition', () => {
  it('should return inline for safe MIME types', () => {
    expect(getContentDisposition('image/png')).toBe('inline');
    expect(getContentDisposition('application/pdf')).toBe('inline');
  });

  it('should return attachment for unsafe MIME types', () => {
    expect(getContentDisposition('text/html')).toBe('attachment');
    expect(getContentDisposition('application/xml')).toBe('attachment');
    expect(getContentDisposition('application/octet-stream')).toBe(
      'attachment',
    );
  });
});
