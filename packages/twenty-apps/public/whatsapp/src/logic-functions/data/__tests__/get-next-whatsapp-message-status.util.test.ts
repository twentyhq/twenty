import { describe, expect, it } from 'vitest';
import { getNextWhatsAppMessageStatus } from 'src/logic-functions/data/get-next-whatsapp-message-status.util';

describe('getNextWhatsAppMessageStatus', () => {
  it('should set the first status of a message', () => {
    expect(getNextWhatsAppMessageStatus({ currentStatus: null, reportedStatus: 'sent' })).toBe('SENT');
  });

  it('should move a message forward', () => {
    expect(getNextWhatsAppMessageStatus({ currentStatus: 'DELIVERED', reportedStatus: 'read' })).toBe('READ');
  });

  it('should ignore a status that arrives after a later one', () => {
    expect(getNextWhatsAppMessageStatus({ currentStatus: 'READ', reportedStatus: 'delivered' })).toBeUndefined();
  });

  it('should mark a sent message as failed', () => {
    expect(getNextWhatsAppMessageStatus({ currentStatus: 'SENT', reportedStatus: 'failed' })).toBe('FAILED');
  });
});
