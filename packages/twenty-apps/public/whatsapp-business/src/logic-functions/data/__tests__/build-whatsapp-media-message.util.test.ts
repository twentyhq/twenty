import { describe, expect, it } from 'vitest';
import { buildWhatsAppMediaMessage } from 'src/logic-functions/data/build-whatsapp-media-message.util';

describe('buildWhatsAppMediaMessage', () => {
  it('should send a document with its filename', () => {
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', messageType: 'document', filename: 'invoice.pdf' })).toEqual({
      type: 'document',
      document: { id: 'm', filename: 'invoice.pdf' },
    });
  });

  it('should send other media by id only', () => {
    expect(buildWhatsAppMediaMessage({ mediaId: 'm', messageType: 'image', filename: 'a.png' })).toEqual({
      type: 'image',
      image: { id: 'm' },
    });
  });
});
