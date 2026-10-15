import { computeApplicationTranslationSyncActions } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-actions.util';

const existingRows = [
  {
    locale: 'fr-FR' as const,
    messages: { unchanged: 'Même', edited: 'Ancien', removed: 'Supprimé' },
    deletedAt: null,
  },
];

describe('computeApplicationTranslationSyncActions', () => {
  it('reports added, edited and removed messages without unchanged entries', () => {
    expect(
      computeApplicationTranslationSyncActions({
        existingRows,
        translations: {
          'fr-FR': { unchanged: 'Même', edited: 'Nouveau', added: 'Ajouté' },
        },
      }),
    ).toEqual([
      {
        type: 'update',
        metadataName: 'applicationTranslation',
        locale: 'fr-FR',
        diff: {
          added: { before: null, after: 'Ajouté' },
          edited: { before: 'Ancien', after: 'Nouveau' },
          removed: { before: 'Supprimé', after: null },
        },
      },
    ]);
  });

  it('does not report unchanged catalogs or absent translations', () => {
    expect(
      computeApplicationTranslationSyncActions({
        existingRows,
        translations: undefined,
      }),
    ).toEqual([]);
    expect(
      computeApplicationTranslationSyncActions({
        existingRows,
        translations: { 'fr-FR': { ...existingRows[0].messages } },
      }),
    ).toEqual([]);
  });

  it('reports explicit removal independently from metadata deletion inference', () => {
    expect(
      computeApplicationTranslationSyncActions({
        existingRows,
        translations: {},
      }),
    ).toEqual([
      {
        type: 'delete',
        metadataName: 'applicationTranslation',
        locale: 'fr-FR',
        diff: {
          unchanged: { before: 'Même', after: null },
          edited: { before: 'Ancien', after: null },
          removed: { before: 'Supprimé', after: null },
        },
      },
    ]);
  });

  it('reports a revived locale as a creation and ignores already deleted locales', () => {
    const deletedRows = [{ ...existingRows[0], deletedAt: new Date() }];
    expect(
      computeApplicationTranslationSyncActions({
        existingRows: deletedRows,
        translations: {},
      }),
    ).toEqual([]);
    expect(
      computeApplicationTranslationSyncActions({
        existingRows: deletedRows,
        translations: { 'fr-FR': { edited: 'Nouveau' } },
      }),
    ).toEqual([
      {
        type: 'create',
        metadataName: 'applicationTranslation',
        locale: 'fr-FR',
        diff: { edited: { before: null, after: 'Nouveau' } },
      },
    ]);
  });
});
