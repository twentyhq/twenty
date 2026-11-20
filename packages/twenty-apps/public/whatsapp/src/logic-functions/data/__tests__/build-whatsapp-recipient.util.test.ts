import { describe, expect, it } from 'vitest';
import { buildWhatsAppRecipient } from 'src/logic-functions/data/build-whatsapp-recipient.util';

describe('buildWhatsAppRecipient', () => {
  it('should send to a phone number with to', () => {
    expect(buildWhatsAppRecipient('16505551234')).toEqual({ to: '16505551234' });
  });

  it('should send to a business-scoped user ID with recipient', () => {
    expect(buildWhatsAppRecipient('US.13491208655302741918')).toEqual({
      recipient: 'US.13491208655302741918',
    });
  });
});
