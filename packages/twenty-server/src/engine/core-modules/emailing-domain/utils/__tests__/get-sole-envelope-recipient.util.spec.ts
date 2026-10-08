import { getSoleEnvelopeRecipient } from 'src/engine/core-modules/emailing-domain/utils/get-sole-envelope-recipient.util';

describe('getSoleEnvelopeRecipient', () => {
  it('should return the single primary recipient', () => {
    expect(getSoleEnvelopeRecipient({ to: ['ada@example.com'] })).toBe(
      'ada@example.com',
    );
  });

  it('should return null when the envelope carries several primary recipients', () => {
    expect(
      getSoleEnvelopeRecipient({
        to: ['ada@example.com', 'grace@example.com'],
      }),
    ).toBeNull();
  });

  it('should return null when a copied recipient would receive the same body', () => {
    expect(
      getSoleEnvelopeRecipient({
        to: ['ada@example.com'],
        cc: ['grace@example.com'],
      }),
    ).toBeNull();
  });

  it('should count blind-copied recipients', () => {
    expect(
      getSoleEnvelopeRecipient({
        to: ['ada@example.com'],
        bcc: ['grace@example.com'],
      }),
    ).toBeNull();
  });

  it('should return null when there is no recipient at all', () => {
    expect(getSoleEnvelopeRecipient({ to: [] })).toBeNull();
  });
});
