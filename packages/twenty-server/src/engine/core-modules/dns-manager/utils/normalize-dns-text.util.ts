export const normalizeDnsText = (text: string): string =>
  text.trim().toLowerCase().replace(/\.$/, '');
