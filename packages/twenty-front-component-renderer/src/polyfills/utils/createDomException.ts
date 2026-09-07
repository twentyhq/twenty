export const createDomException = (message: string, name: string): Error => {
  if (typeof DOMException === 'function') {
    return new DOMException(message, name);
  }

  const fallbackError = new Error(message);
  fallbackError.name = name;

  return fallbackError;
};
