import { describe, expect, it } from 'vitest';
import { buildWhatsAppThreadExternalId } from 'src/logic-functions/data/build-whatsapp-thread-external-id.util';

describe('buildWhatsAppThreadExternalId', () => {
  it('should key group conversations by group ID', () => {
    expect(
      buildWhatsAppThreadExternalId({ groupId: 'group-id', customerIdentity: { whatsAppUserId: 'US.1' } }),
    ).toBe('group-id');
  });

  it('should prefer the user ID over the phone number', () => {
    expect(
      buildWhatsAppThreadExternalId({ customerIdentity: { whatsAppId: '16505551234', whatsAppUserId: 'US.1' } }),
    ).toBe('US.1');
  });

  it('should fall back to the phone number', () => {
    expect(buildWhatsAppThreadExternalId({ customerIdentity: { whatsAppId: '16505551234' } })).toBe('16505551234');
  });
});
