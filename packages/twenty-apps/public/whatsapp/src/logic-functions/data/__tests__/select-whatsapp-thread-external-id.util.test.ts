import { describe, expect, it } from 'vitest';
import { selectWhatsAppThreadExternalId } from 'src/logic-functions/data/select-whatsapp-thread-external-id.util';

const CUSTOMER = { whatsAppId: '16505551234', whatsAppUserId: 'US.1' };

describe('selectWhatsAppThreadExternalId', () => {
  it('should key group conversations by group ID', () => {
    expect(
      selectWhatsAppThreadExternalId({ groupId: 'group-id', customerIdentity: CUSTOMER, existingThreadExternalIds: [] }),
    ).toBe('group-id');
  });

  it('should start a new conversation on the user ID', () => {
    expect(selectWhatsAppThreadExternalId({ customerIdentity: CUSTOMER, existingThreadExternalIds: [] })).toBe('US.1');
  });

  it('should continue a conversation that started on the phone number', () => {
    expect(
      selectWhatsAppThreadExternalId({ customerIdentity: CUSTOMER, existingThreadExternalIds: ['16505551234'] }),
    ).toBe('16505551234');
  });

  it('should prefer the user ID thread when both exist', () => {
    expect(
      selectWhatsAppThreadExternalId({ customerIdentity: CUSTOMER, existingThreadExternalIds: ['16505551234', 'US.1'] }),
    ).toBe('US.1');
  });

  it('should fall back to the phone number for customers without a user ID', () => {
    expect(
      selectWhatsAppThreadExternalId({ customerIdentity: { whatsAppId: '16505551234' }, existingThreadExternalIds: [] }),
    ).toBe('16505551234');
  });
});
