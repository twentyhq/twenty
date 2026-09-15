import { getSiteUrl } from '@/auth/utils/getSiteUrl';

describe('getSiteUrl', () => {
  it.each([
    ['ar-SA', 'ar'],
    ['cs-CZ', 'cs'],
    ['de-DE', 'de'],
    ['es-ES', 'es'],
    ['fr-FR', 'fr'],
    ['it-IT', 'it'],
    ['ja-JP', 'ja'],
    ['ko-KR', 'ko'],
    ['pt-BR', 'pt'],
    ['pt-PT', 'pt'],
    ['ro-RO', 'ro'],
    ['ru-RU', 'ru'],
    ['tr-TR', 'tr'],
    ['zh-CN', 'zh'],
    ['zh-TW', 'zh'],
  ])(
    'uses the localized Twenty website path for %s',
    (locale, language) => {
      expect(getSiteUrl(locale, 'privacy-policy')).toBe(
        `https://twenty.com/${language}/privacy-policy`,
      );
    },
  );

  it('uses the default Twenty website path for English', () => {
    expect(getSiteUrl('en', 'terms')).toBe(
      'https://twenty.com/terms',
    );
  });

  it('uses English for the pseudo locale', () => {
    expect(getSiteUrl('pseudo-en', 'terms')).toBe(
      'https://twenty.com/terms',
    );
  });
});
