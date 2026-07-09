import { describe, expect, it } from 'vitest';

import { resolveWhatsappReplyRecipient } from 'src/front-components/utils/resolve-whatsapp-reply-recipient.util';

describe('resolveWhatsappReplyRecipient', () => {
  it('returns the FROM participant handle when incoming messages exist', () => {
    const recipientHandle = resolveWhatsappReplyRecipient({
      whatsappParticipants: [
        { handle: '15551230000', role: 'TO' },
        { handle: '4915791234567', role: 'FROM' },
      ],
      personPhones: undefined,
    });

    expect(recipientHandle).toBe('4915791234567');
  });

  it('falls back to any participant handle when no FROM participant exists', () => {
    const recipientHandle = resolveWhatsappReplyRecipient({
      whatsappParticipants: [{ handle: '4915791234567', role: 'TO' }],
      personPhones: undefined,
    });

    expect(recipientHandle).toBe('4915791234567');
  });

  it('falls back to the person phones when there are no participants', () => {
    const recipientHandle = resolveWhatsappReplyRecipient({
      whatsappParticipants: [],
      personPhones: {
        primaryPhoneCallingCode: '+49',
        primaryPhoneNumber: '15791234567',
      },
    });

    expect(recipientHandle).toBe('+4915791234567');
  });

  it('ignores participants with empty handles', () => {
    const recipientHandle = resolveWhatsappReplyRecipient({
      whatsappParticipants: [{ handle: '', role: 'FROM' }],
      personPhones: {
        primaryPhoneCallingCode: '+49',
        primaryPhoneNumber: '15791234567',
      },
    });

    expect(recipientHandle).toBe('+4915791234567');
  });

  it('returns undefined when no recipient can be resolved', () => {
    const recipientHandle = resolveWhatsappReplyRecipient({
      whatsappParticipants: [],
      personPhones: undefined,
    });

    expect(recipientHandle).toBeUndefined();
  });
});
