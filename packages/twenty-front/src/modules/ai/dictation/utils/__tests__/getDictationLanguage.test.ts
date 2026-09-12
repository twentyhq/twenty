import { getDictationLanguage } from '@/ai/dictation/utils/getDictationLanguage';

describe('getDictationLanguage', () => {
  it('uses the workspace member locale', () => {
    expect(getDictationLanguage('fr-FR')).toBe('fr-FR');
  });

  it.each([undefined, null, ''])(
    'falls back to the source locale for %p',
    (locale) => {
      expect(getDictationLanguage(locale)).toBe('en');
    },
  );

  // The pseudo locale is a translation-coverage tool, not a language anything
  // can be recognised in.
  it('falls back to the source locale for the pseudo locale', () => {
    expect(getDictationLanguage('pseudo-en')).toBe('en');
  });
});
