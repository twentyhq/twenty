import { computeApplicationTranslationSyncPlan } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-plan.util';

describe('computeApplicationTranslationSyncPlan', () => {
  it('inserts the locales a first sync brings', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [],
        translations: { 'fr-FR': { abc123: 'Entreprise' } },
      }),
    ).toEqual({
      rowsToUpdate: [],
      rowsToInsert: [{ locale: 'fr-FR', messages: { abc123: 'Entreprise' } }],
      rowIdsToSoftDelete: [],
    });
  });

  it('updates a locale it already stores', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [{ id: 'row-fr', locale: 'fr-FR', deletedAt: null }],
        translations: { 'fr-FR': { abc123: 'Société' } },
      }),
    ).toEqual({
      rowsToUpdate: [{ id: 'row-fr', messages: { abc123: 'Société' } }],
      rowsToInsert: [],
      rowIdsToSoftDelete: [],
    });
  });

  it('prunes only the locales the manifest dropped', () => {
    const plan = computeApplicationTranslationSyncPlan({
      existingRows: [
        { id: 'row-fr', locale: 'fr-FR', deletedAt: null },
        { id: 'row-de', locale: 'de-DE', deletedAt: null },
      ],
      translations: { 'fr-FR': { abc123: 'Entreprise' } },
    });

    expect(plan.rowIdsToSoftDelete).toEqual(['row-de']);
    expect(plan.rowsToUpdate).toEqual([
      { id: 'row-fr', messages: { abc123: 'Entreprise' } },
    ]);
  });

  it('prunes every locale when the manifest declares none', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [
          { id: 'row-fr', locale: 'fr-FR', deletedAt: null },
          { id: 'row-de', locale: 'de-DE', deletedAt: null },
        ],
        translations: {},
      }).rowIdsToSoftDelete,
    ).toEqual(['row-fr', 'row-de']);
  });

  it('leaves an already soft-deleted row out of the prune list', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [
          { id: 'row-fr', locale: 'fr-FR', deletedAt: new Date() },
        ],
        translations: {},
      }).rowIdsToSoftDelete,
    ).toEqual([]);
  });

  it('revives a soft-deleted locale instead of inserting a duplicate', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [
          { id: 'row-fr-old', locale: 'fr-FR', deletedAt: new Date() },
        ],
        translations: { 'fr-FR': { abc123: 'Entreprise' } },
      }),
    ).toEqual({
      rowsToUpdate: [{ id: 'row-fr-old', messages: { abc123: 'Entreprise' } }],
      rowsToInsert: [],
      rowIdsToSoftDelete: [],
    });
  });
});
