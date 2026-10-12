import { hasCjkCharacters } from 'src/engine/core-modules/search/utils/has-cjk-characters';

describe('hasCjkCharacters', () => {
  it.each([
    '商业',
    'ひらがな',
    'カタカナ',
    '한국어',
    'Acme 商业',
    'Acmeカタカナ',
    '𠀀',
    'ｶﾀｶﾅ',
    '한',
  ])('returns true for %s', (text) => {
    expect(hasCjkCharacters(text)).toBe(true);
  });

  it.each([
    'bignardi',
    'nardi',
    'café',
    '12345',
    '🙂',
    'Привет',
    'مرحبا',
    '',
    '   ',
  ])('returns false for %s', (text) => {
    expect(hasCjkCharacters(text)).toBe(false);
  });
});
