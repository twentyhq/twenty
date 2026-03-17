/**
 * Formats a phone number from raw format (e.g. "4917612345678@s.whatsapp.net")
 * into a human-readable international format (e.g. "+49 176 1234 5678").
 */
export const formatPhoneNumber = (raw: string): string => {
  // Strip WhatsApp JID suffix
  let digits = raw.replace(/@.*$/, '').replace(/\D/g, '');

  if (!digits) return raw;

  // German numbers: 49...
  if (digits.startsWith('49')) {
    const national = digits.slice(2);
    // Mobile prefixes: 15x, 16x, 17x
    if (/^1[567]\d/.test(national)) {
      const prefix = national.slice(0, 3);
      const rest = national.slice(3);
      // Group rest in chunks of 4
      const grouped = rest.replace(/(\d{4})(?=\d)/g, '$1 ');
      return `+49 ${prefix} ${grouped}`.trim();
    }
    // Landline or other: group generically
    return `+49 ${national.replace(/(\d{3,4})(?=\d)/g, '$1 ')}`.trim();
  }

  // Austrian numbers: 43...
  if (digits.startsWith('43')) {
    const national = digits.slice(2);
    return `+43 ${national.replace(/(\d{3,4})(?=\d)/g, '$1 ')}`.trim();
  }

  // Swiss numbers: 41...
  if (digits.startsWith('41')) {
    const national = digits.slice(2);
    return `+41 ${national.replace(/(\d{2,3})(?=\d)/g, '$1 ')}`.trim();
  }

  // Generic: +CC then group digits
  if (digits.length > 10) {
    // Assume 1-3 digit country code, group the rest
    const cc = digits.length > 11 ? digits.slice(0, 2) : digits.slice(0, 1);
    const rest = digits.slice(cc.length);
    return `+${cc} ${rest.replace(/(\d{3,4})(?=\d)/g, '$1 ')}`.trim();
  }

  // Short numbers, just add +
  return `+${digits}`;
};
