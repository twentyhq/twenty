import { isEditingThroughTranslation } from '@/settings/translations/utils/isEditingThroughTranslation';

describe('isEditingThroughTranslation', () => {
  it('returns false when the viewer reads the canonical value', () => {
    expect(
      isEditingThroughTranslation({
        dirtyTranslatableProperties: ['labelSingular'],
        translationRows: [
          {
            property: 'labelSingular',
            value: 'Company',
            canonicalValue: 'Company',
          },
        ],
      }),
    ).toBe(false);
  });

  it('returns true when the viewer reads a translation', () => {
    expect(
      isEditingThroughTranslation({
        dirtyTranslatableProperties: ['labelSingular'],
        translationRows: [
          {
            property: 'labelSingular',
            value: 'Entreprise',
            canonicalValue: 'Company',
          },
        ],
      }),
    ).toBe(true);
  });

  // The case the source-locale shortcut used to miss: an object authored in
  // French carries an English translation, so an English viewer is reading a
  // translation too and renaming behind it would look like a no-op.
  it('returns true for a translation stored in the source language', () => {
    expect(
      isEditingThroughTranslation({
        dirtyTranslatableProperties: ['labelSingular'],
        translationRows: [
          {
            property: 'labelSingular',
            value: 'Company',
            canonicalValue: 'Entreprise',
          },
        ],
      }),
    ).toBe(true);
  });

  it('ignores properties the edit did not touch', () => {
    expect(
      isEditingThroughTranslation({
        dirtyTranslatableProperties: ['description'],
        translationRows: [
          {
            property: 'labelSingular',
            value: 'Entreprise',
            canonicalValue: 'Company',
          },
        ],
      }),
    ).toBe(false);
  });

  it('returns false when no row covers the edited property', () => {
    expect(
      isEditingThroughTranslation({
        dirtyTranslatableProperties: ['labelSingular'],
        translationRows: [],
      }),
    ).toBe(false);
  });
});
