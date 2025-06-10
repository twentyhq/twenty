export const formatSearchTerms = (
  searchTerm: string,
  operator: 'and' | 'or' = 'and',
) => {
  if (searchTerm.trim() === '') {
    return '';
  }
  const words = searchTerm.trim().split(/\s+/);
  const formattedWords = words.map((word) => {
    const escapedWord = word.replace(/[\\:'&|!()@<>]/g, '\\$&');

    return `${escapedWord}:*`;
  });

  return formattedWords.join(` ${operator === 'and' ? '&' : '|'} `);
};
