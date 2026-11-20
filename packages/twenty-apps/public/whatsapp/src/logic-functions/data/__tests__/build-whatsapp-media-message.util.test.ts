import { describe, expect, it } from 'vitest';
import { buildWhatsAppMediaMessage } from 'src/logic-functions/data/build-whatsapp-media-message.util';

describe('buildWhatsAppMediaMessage', () => {
  it('should send images, videos and audio as their own type', () => {
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', contentType: 'image/png', filename: 'a.png' }).type).toBe('image');
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', contentType: 'video/mp4', filename: 'a.mp4' }).type).toBe('video');
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', contentType: 'audio/ogg', filename: 'a.ogg' }).type).toBe('audio');
  });

  it('should send any other file as a document with its filename', () => {
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', contentType: 'application/pdf', filename: 'invoice.pdf' })).toEqual({
      type: 'document',
      document: { id: 'm', filename: 'invoice.pdf' },
    });
  });
});
