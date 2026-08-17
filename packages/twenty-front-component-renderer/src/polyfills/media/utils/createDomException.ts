// Media polyfill failures mirror native error shapes so application code can
// branch on error.name the way it would against the real APIs.
export const createDomException = (message: string, name: string): Error => {
  if (typeof DOMException === 'function') {
    return new DOMException(message, name);
  }

  const fallbackError = new Error(message);
  fallbackError.name = name;

  return fallbackError;
};
