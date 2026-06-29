import { describe, expect, it } from 'vitest';

import {
  getTranslationCatalogKey,
  interpolateMessage,
  normalizeMessageDescriptor,
  parseTranslationCatalogKey,
} from '@/sdk/front-component/i18n/message';

describe('normalizeMessageDescriptor', () => {
  it('wraps a bare string into a descriptor', () => {
    expect(normalizeMessageDescriptor('Save')).toEqual({ message: 'Save' });
  });

  it('passes a descriptor through unchanged', () => {
    expect(normalizeMessageDescriptor({ message: 'Open', context: 'door' })).toEqual(
      { message: 'Open', context: 'door' },
    );
  });
});

describe('translation catalog key', () => {
  it('uses the raw message when there is no context', () => {
    expect(getTranslationCatalogKey('Save')).toBe('Save');
    expect(getTranslationCatalogKey('Save', '')).toBe('Save');
  });

  it('disambiguates identical messages with different contexts', () => {
    expect(getTranslationCatalogKey('Open', 'door')).not.toBe(
      getTranslationCatalogKey('Open', 'window'),
    );
  });

  it('round-trips through parseTranslationCatalogKey', () => {
    expect(parseTranslationCatalogKey(getTranslationCatalogKey('Save'))).toEqual(
      { message: 'Save' },
    );
    expect(
      parseTranslationCatalogKey(getTranslationCatalogKey('Open', 'door')),
    ).toEqual({ message: 'Open', context: 'door' });
  });
});

describe('interpolateMessage', () => {
  it('returns the template unchanged when no values are given', () => {
    expect(interpolateMessage('Hello {name}')).toBe('Hello {name}');
  });

  it('substitutes named placeholders', () => {
    expect(interpolateMessage('Saved {count} cards', { count: 3 })).toBe(
      'Saved 3 cards',
    );
  });

  it('leaves unknown placeholders intact', () => {
    expect(interpolateMessage('Hi {name} from {city}', { name: 'Ada' })).toBe(
      'Hi Ada from {city}',
    );
  });
});
