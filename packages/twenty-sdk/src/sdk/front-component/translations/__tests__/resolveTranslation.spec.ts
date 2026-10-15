import { afterEach, describe, expect, it } from 'vitest';

import { setFrontComponentTranslations } from '@/sdk/front-component/translations/front-component-translations';
import { generateMessageId } from 'twenty-shared/i18n';
import { resolveTranslation } from '@/sdk/front-component/translations/resolveTranslation';

afterEach(() => {
  setFrontComponentTranslations({});
});

describe('resolveTranslation', () => {
  it('returns the translation for the active locale', () => {
    setFrontComponentTranslations({
      'fr-FR': { [generateMessageId('Save')]: 'Enregistrer' },
    });

    expect(resolveTranslation({ descriptor: 'Save', locale: 'fr-FR' })).toBe(
      'Enregistrer',
    );
  });

  it('falls back to the source message when the locale is missing', () => {
    setFrontComponentTranslations({
      'fr-FR': { [generateMessageId('Save')]: 'Enregistrer' },
    });

    expect(resolveTranslation({ descriptor: 'Save', locale: 'de-DE' })).toBe(
      'Save',
    );
  });

  it('falls back to the source message when the key is untranslated', () => {
    setFrontComponentTranslations({ 'fr-FR': {} });

    expect(resolveTranslation({ descriptor: 'Cancel', locale: 'fr-FR' })).toBe(
      'Cancel',
    );
  });

  it('resolves context-disambiguated messages independently', () => {
    setFrontComponentTranslations({
      'fr-FR': {
        [generateMessageId('Open', 'door')]: 'Ouvrir',
        [generateMessageId('Open', 'window')]: 'Lever',
      },
    });

    expect(
      resolveTranslation({
        descriptor: { message: 'Open', context: 'door' },
        locale: 'fr-FR',
      }),
    ).toBe('Ouvrir');
    expect(
      resolveTranslation({
        descriptor: { message: 'Open', context: 'window' },
        locale: 'fr-FR',
      }),
    ).toBe('Lever');
  });

  it('interpolates values into the resolved translation', () => {
    setFrontComponentTranslations({
      'fr-FR': {
        [generateMessageId('Saved {count} cards')]:
          'Cartes enregistrées : {count}',
      },
    });

    expect(
      resolveTranslation({
        descriptor: 'Saved {count} cards',
        values: { count: 5 },
        locale: 'fr-FR',
      }),
    ).toBe('Cartes enregistrées : 5');
  });
});
