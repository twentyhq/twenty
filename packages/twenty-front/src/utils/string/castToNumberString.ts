export const castToNumberString = (value: string): string =>
  value?.replaceAll(/\D/g, '') || '';
