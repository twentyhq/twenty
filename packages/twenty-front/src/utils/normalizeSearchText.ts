export const normalizeSearchText = (
  text: string | null | undefined,
): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[øØ]/g, 'o')
    .replace(/[åÅ]/g, 'a')
    .replace(/[æÆ]/g, 'ae')
    .replace(/[ßẞ]/g, 'ss')
    .replace(/[ðÐ]/g, 'd')
    .replace(/[þÞ]/g, 'th')
    .replace(/[łŁ]/g, 'l')
    .replace(/[œŒ]/g, 'oe')
    .toLowerCase();
};
