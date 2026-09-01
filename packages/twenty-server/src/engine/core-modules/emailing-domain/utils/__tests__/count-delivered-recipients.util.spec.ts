import { countDeliveredRecipients } from 'src/engine/core-modules/emailing-domain/utils/count-delivered-recipients.util';

describe('countDeliveredRecipients', () => {
  it('counts a single to recipient', () => {
    expect(
      countDeliveredRecipients({ to: ['a@example.com'], cc: [], bcc: [] }),
    ).toBe(1);
  });

  it('counts to, cc and bcc together', () => {
    expect(
      countDeliveredRecipients({
        to: ['a@example.com', 'b@example.com'],
        cc: ['c@example.com'],
        bcc: ['d@example.com', 'e@example.com'],
      }),
    ).toBe(5);
  });

  it('returns 0 when the provider delivered to nobody', () => {
    expect(countDeliveredRecipients({ to: [], cc: [], bcc: [] })).toBe(0);
  });
});
