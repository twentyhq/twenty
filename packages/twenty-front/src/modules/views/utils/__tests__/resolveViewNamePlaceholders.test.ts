import { i18n } from '@lingui/core';

import { type FlatObjectMetadataItem } from '@/metadata-store/types/FlatObjectMetadataItem';
import { resolveViewNamePlaceholders } from '@/views/utils/resolveViewNamePlaceholders';
import { ViewKey } from 'twenty-shared/types';
import { messages as enMessages } from '~/locales/generated/en';

const objectMetadataItem = {
  labelSingular: 'Company',
  labelPlural: 'Companies',
} as FlatObjectMetadataItem;

beforeEach(() => {
  i18n.load('en', enMessages);
  i18n.activate('en');
});

describe('resolveViewNamePlaceholders', () => {
  it('translates the engine-provisioned INDEX view', () => {
    expect(
      resolveViewNamePlaceholders(
        'All {objectLabelPlural}',
        objectMetadataItem,
        ViewKey.INDEX,
      ),
    ).toBe('All Companies');
  });

  /**
   * The regression the translation exists for. Asserting in English only cannot see it:
   * the untranslated interpolation and the translated one both read "All Companies".
   */
  it('really goes through the catalogue, not through interpolation', () => {
    i18n.load('xx', { 'All {0}': 'Todas las {0}' });
    i18n.activate('xx');

    expect(
      resolveViewNamePlaceholders(
        'All {objectLabelPlural}',
        objectMetadataItem,
        ViewKey.INDEX,
      ),
    ).toBe('Todas las Companies');
  });

  /**
   * The name is a string a user can type. Translating a view because it happens to match
   * would rewrite wording its author chose, which is what the key is there to prevent.
   */
  it('leaves a user-authored view with the same name alone', () => {
    i18n.load('xx', { 'All {0}': 'Todas las {0}' });
    i18n.activate('xx');

    expect(
      resolveViewNamePlaceholders('All {objectLabelPlural}', objectMetadataItem),
    ).toBe('All Companies');
  });

  it('resolves the plural placeholder in a custom view name', () => {
    expect(
      resolveViewNamePlaceholders('Active {objectLabelPlural}', objectMetadataItem),
    ).toBe('Active Companies');
  });

  it('resolves the singular placeholder', () => {
    expect(
      resolveViewNamePlaceholders('{objectLabelSingular} pipeline', objectMetadataItem),
    ).toBe('Company pipeline');
  });

  it('leaves a name without placeholders untouched', () => {
    expect(resolveViewNamePlaceholders('My view', objectMetadataItem)).toBe('My view');
  });

  it('returns an empty string when the name is undefined', () => {
    expect(resolveViewNamePlaceholders(undefined, objectMetadataItem)).toBe('');
  });

  it('returns the raw name when the object metadata is missing', () => {
    // Nothing to interpolate with: showing the template beats showing nothing.
    expect(
      resolveViewNamePlaceholders('All {objectLabelPlural}', undefined, ViewKey.INDEX),
    ).toBe('All {objectLabelPlural}');
  });
});
