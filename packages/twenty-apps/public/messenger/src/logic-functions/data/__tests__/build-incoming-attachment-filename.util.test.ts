import { describe, expect, it } from 'vitest';

import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';

describe('buildIncomingAttachmentFilename', () => {
  it('uses the file name of the attachment URL', () => {
    expect(
      buildIncomingAttachmentFilename({
        url: 'https://scontent.xx.fbcdn.net/v/t1.15752-9/photo%20one.jpg?_nc_cat=1',
        attachmentType: 'image',
        messageId: 'm-1',
        index: 0,
      }),
    ).toBe('photo one.jpg');
  });

  it('falls back to the attachment type and message when the URL has no file name', () => {
    expect(
      buildIncomingAttachmentFilename({
        url: 'https://cdn.fbsbx.com/',
        attachmentType: 'audio',
        messageId: 'm-1',
        index: 2,
      }),
    ).toBe('audio-m-1-2');
  });
});
