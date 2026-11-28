import { i18n } from '@lingui/core';

import { initialI18nActivate } from '~/utils/i18n/initialI18nActivate';
import { persistLocale } from '~/utils/i18n/persistLocale';

describe('persistLocale', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('makes the next load start in the persisted locale rather than the browser one', async () => {
    jest.spyOn(window.navigator, 'language', 'get').mockReturnValue('fr-FR');
    jest.spyOn(window.navigator, 'languages', 'get').mockReturnValue(['fr-FR']);

    persistLocale('de-DE');
    initialI18nActivate();

    await waitForLocale('de-DE');
    expect(document.documentElement.lang).toBe('de-DE');
  });

  it('does not throw when localStorage is unavailable', () => {
    const setItem = jest
      .spyOn(Storage.prototype, 'setItem')
      .mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

    expect(() => persistLocale('de-DE')).not.toThrow();

    setItem.mockRestore();
  });
});

const waitForLocale = async (locale: string) => {
  for (let attempt = 0; attempt < 50 && i18n.locale !== locale; attempt++) {
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
};
