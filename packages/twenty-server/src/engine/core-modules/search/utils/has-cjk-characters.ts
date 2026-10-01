const CJK_CHARACTER_PATTERN =
  /[\p{Script_Extensions=Han}\p{Script_Extensions=Hiragana}\p{Script_Extensions=Katakana}\p{Script_Extensions=Hangul}]/u;

export const hasCjkCharacters = (text: string) =>
  CJK_CHARACTER_PATTERN.test(text);
