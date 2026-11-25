import { describe, expect, it } from 'vitest';

import { buildWhatsappAttachmentFilename } from 'src/logic-functions/utils/build-whatsapp-attachment-filename.util';

describe('buildWhatsappAttachmentFilename', () => {
  it('keeps the filename WhatsApp gave the document', () => {
    expect(
      buildWhatsappAttachmentFilename({
        type: 'file',
        mimetype: 'application/pdf',
        filename: ' Proposal.pdf ',
      }),
    ).toBe('Proposal.pdf');
  });

  it('names unnamed media after their type and mime type', () => {
    expect(
      buildWhatsappAttachmentFilename({ type: 'img', mimetype: 'image/jpeg' }),
    ).toBe('whatsapp-image.jpg');
    expect(
      buildWhatsappAttachmentFilename({
        type: 'audio',
        mimetype: 'audio/ogg; codecs=opus',
      }),
    ).toBe('whatsapp-audio.ogg');
    expect(
      buildWhatsappAttachmentFilename({ type: 'file', mimetype: '' }),
    ).toBe('whatsapp-file');
  });

  it('shortens a long filename and keeps its extension', () => {
    const filename = buildWhatsappAttachmentFilename({
      type: 'file',
      mimetype: 'application/pdf',
      filename: `${'a'.repeat(300)}.pdf`,
    });

    expect(filename).toHaveLength(255);
    expect(filename.endsWith('.pdf')).toBe(true);
  });
});
