// Opaque schemes (file:, data:) serialise to the literal "null" origin, which
// would otherwise allowlist every sandboxed document that sends Origin: null.
export const toComparableOrigin = (url: string): string | undefined => {
  try {
    const parsedUrl = new URL(url);

    if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
      return undefined;
    }

    return parsedUrl.origin.toLowerCase();
  } catch {
    return undefined;
  }
};
