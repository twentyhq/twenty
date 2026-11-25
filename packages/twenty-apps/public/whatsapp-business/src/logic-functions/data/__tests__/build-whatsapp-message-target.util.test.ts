import { describe, expect, it } from 'vitest';
import { buildWhatsAppMessageTarget } from 'src/logic-functions/data/build-whatsapp-message-target.util';

describe('buildWhatsAppMessageTarget', () => {
  it('should reply to a business-scoped user ID through recipient', () => {
    expect(buildWhatsAppMessageTarget('US.13491208655302741918')).toEqual({
      recipient_type: 'individual',
      recipient: 'US.13491208655302741918',
    });
  });

  it('should reply to a phone number through to', () => {
    expect(buildWhatsAppMessageTarget('16505551234')).toEqual({ recipient_type: 'individual', to: '16505551234' });
  });

  it('should reply to a group by its ID', () => {
    expect(buildWhatsAppMessageTarget('Y2FwaV9ncm91cDoxNzA1NTU1MDEzOTo')).toEqual({
      recipient_type: 'group',
      to: 'Y2FwaV9ncm91cDoxNzA1NTU1MDEzOTo',
    });
  });
});
