import { describe, expect, it } from 'vitest';

import { buildIncomingAttachmentFilename } from 'src/logic-functions/data/build-incoming-attachment-filename.util';

describe('buildIncomingAttachmentFilename', () => {
  it('keeps the name of a file the user sent', () => {
    expect(
      buildIncomingAttachmentFilename({
        message: {
          id: '42',
          type: 'file',
          fileName: ' quote.pdf ',
          fileSize: 10,
        },
        contentType: 'application/pdf',
      }),
    ).toBe('quote.pdf');
  });

  it('names media after the message with the extension of its content type', () => {
    expect(
      buildIncomingAttachmentFilename({
        message: {
          id: '42',
          type: 'image',
          contentProvider: { type: 'line' },
        },
        contentType: 'image/jpeg; charset=binary',
      }),
    ).toBe('line-image-42.jpg');
  });

  it('leaves out the extension of an unknown content type', () => {
    expect(
      buildIncomingAttachmentFilename({
        message: {
          id: '42',
          type: 'audio',
          contentProvider: { type: 'line' },
        },
        contentType: 'audio/unknown',
      }),
    ).toBe('line-audio-42');
  });

  it('keeps the end of a file name longer than 255 characters', () => {
    const filename = buildIncomingAttachmentFilename({
      message: {
        id: '42',
        type: 'file',
        fileName: `${'a'.repeat(300)}.pdf`,
        fileSize: 10,
      },
      contentType: null,
    });

    expect(filename).toHaveLength(255);
    expect(filename.endsWith('.pdf')).toBe(true);
  });
});
