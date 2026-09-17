const VISIBLE_ASCII_CHARACTERS_PATTERN = /^[\x21-\x7E]+$/;

export const isValidPdlApiKey = (apiKey: string): boolean =>
  VISIBLE_ASCII_CHARACTERS_PATTERN.test(apiKey);
