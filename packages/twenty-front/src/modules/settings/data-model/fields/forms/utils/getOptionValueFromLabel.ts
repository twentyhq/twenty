import snakeCase from 'lodash.snakecase';

export const getOptionValueFromLabel = (label: string) => {
  // Remove accents
  const unaccentedLabel = label
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
  // Remove special characters
  const noSpecialCharactersLabel = unaccentedLabel.replace(
    /[^a-zA-Z0-9 ]/g,
    '',
  );

  return snakeCase(noSpecialCharactersLabel).toUpperCase();
};
