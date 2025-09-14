// This removes common diacritical marks to match PostgreSQL unaccent behavior
export const unaccentText = (text: string): string => {
  if (!text) return text;

  // First handle special characters that don't decompose with NFD
  const specialChars: Record<string, string> = {
    'æ': 'ae', 'Æ': 'AE',
    'œ': 'oe', 'Œ': 'OE',
    'ø': 'o', 'Ø': 'O',
    'đ': 'd', 'Đ': 'D',
    'ħ': 'h', 'Ħ': 'H',
    'ı': 'i', 'ł': 'l', 'Ł': 'L',
    'ŋ': 'n', 'Ŋ': 'N',
    'ß': 'ss',
    'þ': 'th', 'Þ': 'TH',
  };

  let result = text;

  // Replace special characters first
  for (const [accented, unaccented] of Object.entries(specialChars)) {
    result = result.replace(new RegExp(accented, 'g'), unaccented);
  }

  // Then use Unicode normalization for decomposable characters
  return result
    .normalize('NFD') // Decompose characters with diacritics
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .normalize('NFC'); // Recompose remaining characters
};