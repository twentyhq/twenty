import { getAttachmentPath } from '@/activities/utils/getAttachmentPath';

describe('getAttachmentPath', () => {
  it('should extract the correct path from a locally stored file URL with token', () => {
    const token = 'dybszrrxvgrtefeidgybxzfxzr';
    const res = getAttachmentPath(
      `https://server.com/files/attachment/${token}/image.jpg?queryParam=value`,
    );
    expect(res).toEqual('https://server.com/files/attachment/image.jpg');
  });

  it('should extract the correct path from a regular file URL', () => {
    const res = getAttachmentPath(
      'https://exemple.com/files/images/image.jpg?queryParam=value',
    );
    expect(res).toEqual('https://exemple.com/files/images/image.jpg');
  });
});
