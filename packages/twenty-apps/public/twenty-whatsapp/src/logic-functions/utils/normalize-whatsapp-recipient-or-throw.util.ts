export const normalizeWhatsappRecipientOrThrow = (to: string | string[]): string => {
  const recipient = Array.isArray(to) ? to[0] : to;
  const digits = (recipient ?? '').replace(/\D/g, '');

  if (digits.length === 0) {
    throw new Error(
      `WhatsApp recipient "${String(recipient)}" does not contain a phone number`,
    );
  }

  return digits;
};
