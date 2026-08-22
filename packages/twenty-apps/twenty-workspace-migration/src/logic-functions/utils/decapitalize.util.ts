export const decapitalize = (value: string): string =>
  value.length === 0 ? value : value[0].toLowerCase() + value.slice(1);