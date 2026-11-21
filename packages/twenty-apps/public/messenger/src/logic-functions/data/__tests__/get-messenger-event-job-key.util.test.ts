import { describe, expect, it } from 'vitest';

import { getMessengerEventJobKey } from 'src/logic-functions/data/get-messenger-event-job-key.util';

const BASE_EVENT = {
  sender: { id: 'customer-1' },
  recipient: { id: 'page-1' },
  timestamp: 100,
};

describe('getMessengerEventJobKey', () => {
  it('keys a message by its mid', () => {
    expect(
      getMessengerEventJobKey({ ...BASE_EVENT, message: { mid: 'm-1' } }),
    ).toBe('m-1');
  });

  it('keys each edit of a message separately', () => {
    expect(
      getMessengerEventJobKey({
        ...BASE_EVENT,
        message_edit: { mid: 'm-1', text: 'edited', num_edit: 2 },
      }),
    ).toBe('edit:m-1:2');
  });

  it('keys receipts by their sender and watermark', () => {
    expect(
      getMessengerEventJobKey({
        sender: { id: 'customer-1' },
        recipient: { id: 'page-1' },
        delivery: { watermark: 500 },
      }),
    ).toBe('delivery:customer-1:500');
    expect(
      getMessengerEventJobKey({ ...BASE_EVENT, read: { watermark: 600 } }),
    ).toBe('read:customer-1:600');
  });

  it('keys a referral by its sender and time', () => {
    expect(
      getMessengerEventJobKey({ ...BASE_EVENT, referral: { source: 'ADS' } }),
    ).toBe('referral:customer-1:100');
  });
});
