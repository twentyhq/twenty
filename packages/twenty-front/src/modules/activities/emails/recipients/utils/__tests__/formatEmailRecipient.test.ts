import { formatEmailRecipient } from '@/activities/emails/recipients/utils/formatEmailRecipient';
import { parseEmailRecipients } from '@/activities/emails/recipients/utils/parseEmailRecipients';

describe('formatEmailRecipient', () => {
  it('should return the bare address when there is no display name', () => {
    expect(formatEmailRecipient({ address: 'jane@example.com' })).toBe(
      'jane@example.com',
    );
  });

  it('should format a display name with angle brackets', () => {
    expect(
      formatEmailRecipient({
        address: 'jane@example.com',
        displayName: 'Jane Doe',
      }),
    ).toBe('Jane Doe <jane@example.com>');
  });

  it('should quote display names containing special characters', () => {
    expect(
      formatEmailRecipient({
        address: 'jane@example.com',
        displayName: 'Doe, Jane',
      }),
    ).toBe('"Doe, Jane" <jane@example.com>');
  });

  it('should round trip through parseEmailRecipients', () => {
    const recipient = {
      address: 'jane@example.com',
      displayName: 'Doe, Jane "JD"',
    };

    expect(parseEmailRecipients(formatEmailRecipient(recipient))).toEqual([
      recipient,
    ]);
  });
});
