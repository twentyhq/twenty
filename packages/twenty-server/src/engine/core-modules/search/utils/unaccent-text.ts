export const unaccentText = (text: string): string => {
  if (!text) return text;
  const specialChars: Record<string, string> = {
    æ: 'ae',
    Æ: 'AE',
    œ: 'oe',
    Œ: 'OE',
    ø: 'o',
    Ø: 'O',
    đ: 'd',
    Đ: 'D',
    ħ: 'h',
    Ħ: 'H',
    ı: 'i',
    ł: 'l',
    Ł: 'L',
    ŋ: 'n',
    Ŋ: 'N',
    ß: 'ss',
    þ: 'th',
    Þ: 'TH',
  };

  let result = text;

  for (const [accented, unaccented] of Object.entries(specialChars)) {
    result = result.replace(new RegExp(accented, 'g'), unaccented);
  }

  return result
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .normalize('NFC');
};
