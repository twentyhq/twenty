// The sandboxed worker runs in an opaque origin, which is not a secure
// context: crypto.randomUUID does not exist there, but getRandomValues does.
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
