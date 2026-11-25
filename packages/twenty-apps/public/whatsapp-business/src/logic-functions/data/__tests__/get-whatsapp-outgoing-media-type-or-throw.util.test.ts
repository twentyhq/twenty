import { describe, expect, it } from 'vitest';
import { getWhatsAppOutgoingMediaTypeOrThrow } from 'src/logic-functions/data/get-whatsapp-outgoing-media-type-or-throw.util';

describe('getWhatsAppOutgoingMediaTypeOrThrow', () => {
  it('should map a supported file to its WhatsApp message type', () => {
    expect(getWhatsAppOutgoingMediaTypeOrThrow({ filename: 'a.pdf', contentType: 'application/pdf', size: 1000 })).toBe('document');
    expect(getWhatsAppOutgoingMediaTypeOrThrow({ filename: 'a.ogg', contentType: 'audio/ogg; codecs=opus', size: 1000 })).toBe('audio');
  });

  it('should refuse an unsupported file type', () => {
    expect(() =>
      getWhatsAppOutgoingMediaTypeOrThrow({ filename: 'a.webm', contentType: 'audio/webm', size: 1000 }),
    ).toThrow('audio/webm files are not supported');
  });

  it('should refuse a file over the size limit', () => {
    expect(() =>
      getWhatsAppOutgoingMediaTypeOrThrow({ filename: 'a.png', contentType: 'image/png', size: 6 * 1024 * 1024 }),
    ).toThrow('image files are limited to 5 MB');
  });
});
