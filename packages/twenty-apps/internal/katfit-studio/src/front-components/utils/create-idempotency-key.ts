// Sandboxed front components may lack the secure-context randomUUID API.
export const createIdempotencyKey = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  if (typeof crypto.getRandomValues === 'function') {
    const bytes = crypto.getRandomValues(new Uint8Array(16));

    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;

    const hexadecimal = [...bytes]
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');

    return `${hexadecimal.slice(0, 8)}-${hexadecimal.slice(8, 12)}-${hexadecimal.slice(12, 16)}-${hexadecimal.slice(16, 20)}-${hexadecimal.slice(20)}`;
  }

  return `package-payment-${Date.now()}-${Math.random().toString(36).slice(2)}`;
};
