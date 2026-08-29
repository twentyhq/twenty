import { afterEach, describe, expect, it } from 'vitest';

import { setFrontComponentTranslations } from '@/sdk/front-component/translations/front-component-translations';
import { generateApplicationMessageId } from 'twenty-shared/i18n';
import { resolveTranslation } from '@/sdk/front-component/translations/resolveTranslation';

afterEach(() => {
  setFrontComponentTranslations({});
});

describe('resolveTranslation', () => {
  it('returns the translation for the active locale', () => {
    setFrontComponentTranslations({
      'fr-FR': { [generateApplicationMessageId('Save')]: 'Enregistrer' },
    });

    expect(resolveTranslation('Save', undefined, 'fr-FR')).toBe('Enregistrer');
  });

  it('falls back to the source message when the locale is missing', () => {
    setFrontComponentTranslations({
      'fr-FR': { [generateApplicationMessageId('Save')]: 'Enregistrer' },
    });

    expect(resolveTranslation('Save', undefined, 'de-DE')).toBe('Save');
  });

  it('falls back to the source message when the key is untranslated', () => {
    setFrontComponentTranslations({ 'fr-FR': {} });

    expect(resolveTranslation('Cancel', undefined, 'fr-FR')).toBe('Cancel');
  });

  it('resolves context-disambiguated messages independently', () => {
    setFrontComponentTranslations({
      'fr-FR': {
        [generateApplicationMessageId('Open', 'door')]: 'Ouvrir',
        [generateApplicationMessageId('Open', 'window')]: 'Lever',
      },
    });

    expect(
      resolveTranslation(
        { message: 'Open', context: 'door' },
        undefined,
        'fr-FR',
      ),
    ).toBe('Ouvrir');
    expect(
      resolveTranslation(
        { message: 'Open', context: 'window' },
        undefined,
        'fr-FR',
      ),
    ).toBe('Lever');
  });

  it('interpolates values into the resolved translation', () => {
    setFrontComponentTranslations({
      'fr-FR': {
        [generateApplicationMessageId('Saved {count} cards')]:
          'Cartes enregistrées : {count}',
      },
    });

    expect(
      resolveTranslation('Saved {count} cards', { count: 5 }, 'fr-FR'),
    ).toBe('Cartes enregistrées : 5');
  });
});
