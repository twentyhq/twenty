import { describe, expect, it } from 'vitest';
import { isWithinWhatsAppCustomerServiceWindow } from 'src/logic-functions/data/is-within-whatsapp-customer-service-window.util';

const NOW = new Date('2026-11-20T12:00:00.000Z');

describe('isWithinWhatsAppCustomerServiceWindow', () => {
  it('should allow a reply within 24 hours of the last customer message', () => {
    expect(
      isWithinWhatsAppCustomerServiceWindow({ lastCustomerMessageAt: new Date('2026-11-19T13:00:00.000Z'), now: NOW }),
    ).toBe(true);
  });

  it('should refuse a reply more than 24 hours later', () => {
    expect(
      isWithinWhatsAppCustomerServiceWindow({ lastCustomerMessageAt: new Date('2026-11-19T11:00:00.000Z'), now: NOW }),
    ).toBe(false);
  });

  it('should refuse a reply when the customer never wrote', () => {
    expect(isWithinWhatsAppCustomerServiceWindow({ lastCustomerMessageAt: undefined, now: NOW })).toBe(false);
  });
});
