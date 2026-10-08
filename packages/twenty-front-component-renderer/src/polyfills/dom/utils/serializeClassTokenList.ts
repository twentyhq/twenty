export const serializeClassTokenList = (tokens: string[]): string =>
  [...new Set(tokens)].join(' ');
