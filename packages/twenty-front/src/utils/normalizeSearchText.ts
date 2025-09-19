export const normalizeSearchText = (
  text: string | null | undefined,
): string => {
  if (!text) return '';
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
};
