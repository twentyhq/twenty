import startCase from 'lodash.startcase';

export const convertToLabel = (str: string) => {
  const s = startCase(str).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
};
