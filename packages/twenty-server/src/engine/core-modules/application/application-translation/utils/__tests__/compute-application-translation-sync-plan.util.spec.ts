import { computeApplicationTranslationSyncPlan } from 'src/engine/core-modules/application/application-translation/utils/compute-application-translation-sync-plan.util';

const frenchRow = {
  id: 'row-fr',
  locale: 'fr-FR' as const,
  messages: { greeting: 'Bonjour' },
  deletedAt: null,
};

describe('computeApplicationTranslationSyncPlan', () => {
  it('derives inserts, updates and deletions from the reported changes', () => {
    const plan = computeApplicationTranslationSyncPlan({
      existingRows: [
        frenchRow,
        { ...frenchRow, id: 'row-de', locale: 'de-DE' },
      ],
      translations: {
        'fr-FR': { greeting: 'Salut' },
        'es-ES': { greeting: 'Hola' },
      },
    });

    expect(plan.actions.map(({ type, locale }) => ({ type, locale }))).toEqual([
      { type: 'delete', locale: 'de-DE' },
      { type: 'create', locale: 'es-ES' },
      { type: 'update', locale: 'fr-FR' },
    ]);
    expect(plan.rowsToInsert).toEqual([
      { locale: 'es-ES', messages: { greeting: 'Hola' } },
    ]);
    expect(plan.rowsToUpdate).toEqual([
      { id: 'row-fr', locale: 'fr-FR', messages: { greeting: 'Salut' } },
    ]);
    expect(plan.rowIdsToSoftDelete).toEqual(['row-de']);
  });

  it('does not write unchanged catalogs', () => {
    expect(
      computeApplicationTranslationSyncPlan({
        existingRows: [frenchRow],
        translations: { 'fr-FR': frenchRow.messages },
      }),
    ).toEqual({
      actions: [],
      rowsToInsert: [],
      rowsToUpdate: [],
      rowIdsToSoftDelete: [],
    });
  });

  it('revives a deleted locale but prefers an active row over older deleted rows', () => {
    const deletedRow = {
      ...frenchRow,
      id: 'deleted-fr',
      deletedAt: new Date(),
    };
    const translations = { 'fr-FR': { greeting: 'Salut' } };
    const revived = computeApplicationTranslationSyncPlan({
      existingRows: [deletedRow],
      translations,
    });
    expect(revived.actions[0].type).toBe('create');
    expect(revived.rowsToUpdate[0].id).toBe('deleted-fr');
    expect(revived.rowsToInsert).toEqual([]);

    for (const existingRows of [
      [deletedRow, frenchRow],
      [frenchRow, deletedRow],
    ]) {
      const updated = computeApplicationTranslationSyncPlan({
        existingRows,
        translations,
      });
      expect(updated.actions[0].type).toBe('update');
      expect(updated.rowsToUpdate[0].id).toBe('row-fr');
    }
  });

  it('prunes active rows only when the manifest explicitly declares no locales', () => {
    const plan = computeApplicationTranslationSyncPlan({
      existingRows: [
        frenchRow,
        {
          ...frenchRow,
          id: 'deleted-de',
          locale: 'de-DE',
          deletedAt: new Date(),
        },
      ],
      translations: {},
    });
    expect(plan.rowIdsToSoftDelete).toEqual(['row-fr']);
    expect(plan.actions).toHaveLength(1);
  });
});
