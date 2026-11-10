import { describe, expect, it } from 'vitest';

import { buildLinkedinAttachmentFilename } from 'src/logic-functions/utils/build-linkedin-attachment-filename.util';

describe('buildLinkedinAttachmentFilename', () => {
  it('keeps the filename LinkedIn gave the document', () => {
    expect(
      buildLinkedinAttachmentFilename({
        type: 'file',
        mimetype: 'application/pdf',
        filename: ' Proposal.pdf ',
      }),
    ).toBe('Proposal.pdf');
  });

  it('names unnamed media after their type and mime type', () => {
    expect(
      buildLinkedinAttachmentFilename({ type: 'img', mimetype: 'image/jpeg' }),
    ).toBe('linkedin-image.jpg');
    expect(
      buildLinkedinAttachmentFilename({
        type: 'audio',
        mimetype: 'audio/ogg; codecs=opus',
      }),
    ).toBe('linkedin-audio.ogg');
    expect(
      buildLinkedinAttachmentFilename({ type: 'file', mimetype: '' }),
    ).toBe('linkedin-file');
  });

  it('shortens a long filename and keeps its extension', () => {
    const filename = buildLinkedinAttachmentFilename({
      type: 'file',
      mimetype: 'application/pdf',
      filename: `${'a'.repeat(300)}.pdf`,
    });

    expect(filename).toHaveLength(255);
    expect(filename.endsWith('.pdf')).toBe(true);
  });
});
