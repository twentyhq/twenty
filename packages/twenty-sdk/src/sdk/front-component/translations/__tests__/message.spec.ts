import { describe, expect, it } from 'vitest';

import {
  getTranslationCatalogKey,
  normalizeMessageDescriptor,
  parseTranslationCatalogKey,
} from '@/sdk/front-component/translations/message';

describe('normalizeMessageDescriptor', () => {
  it('wraps a bare string into a descriptor', () => {
    expect(normalizeMessageDescriptor('Save')).toEqual({ message: 'Save' });
  });

  it('passes a descriptor through unchanged', () => {
    expect(
      normalizeMessageDescriptor({ message: 'Open', context: 'door' }),
    ).toEqual({ message: 'Open', context: 'door' });
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
    expect(
      parseTranslationCatalogKey(getTranslationCatalogKey('Save')),
    ).toEqual({ message: 'Save' });
    expect(
      parseTranslationCatalogKey(getTranslationCatalogKey('Open', 'door')),
    ).toEqual({ message: 'Open', context: 'door' });
  });
});
