// The sandboxed worker's opaque origin isn't a secure context, so crypto.randomUUID can be missing.
export const generateRandomId = (): string => {
  if (typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }

  const randomBytes = new Uint8Array(16);
  crypto.getRandomValues(randomBytes);

  return [...randomBytes]
    .map((randomByte) => randomByte.toString(16).padStart(2, '0'))
    .join('');
};
