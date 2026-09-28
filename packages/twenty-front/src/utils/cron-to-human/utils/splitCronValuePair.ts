// Callers only split values already validated to contain the separator
export const splitCronValuePair = (
  value: string,
  separator: string,
): [string, string] => {
  const [first = '', second = ''] = value.split(separator);

  return [first, second];
};
