const ALLOWED_SCHEMES = ['http:', 'https:', 'mailto:', 'tel:'];

export const safeUrl = (value: unknown): string | undefined => {
  if (typeof value !== 'string' || value.trim() === '') {
    return undefined;
  }

  const normalized = value.replace(/[\u0000-\u0020]/g, '');
  const schemeMatch = normalized.match(/^([a-zA-Z][a-zA-Z0-9+.-]*:)/);

  if (schemeMatch === null) {
    return value;
  }

  return ALLOWED_SCHEMES.includes(schemeMatch[1].toLowerCase())
    ? value
    : undefined;
};
