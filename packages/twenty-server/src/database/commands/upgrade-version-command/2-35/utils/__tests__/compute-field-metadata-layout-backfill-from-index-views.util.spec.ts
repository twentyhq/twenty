import { ViewKey } from 'twenty-shared/types';

import { computeFieldMetadataLayoutBackfillFromIndexViews } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-field-metadata-layout-backfill-from-index-views.util';

const NOW = '2026-08-26T00:00:00.000Z';

const buildMaps = <TFlatEntity extends { id: string }>(
  entities: TFlatEntity[],
) =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      entities.map((entity) => [entity.id, entity]),
    ),
    universalIdentifierById: Object.fromEntries(
      entities.map((entity) => [entity.id, entity.id]),
    ),
  }) as never;

const buildView = (overrides: Record<string, unknown>) =>
  ({
    id: 'view-1',
    key: ViewKey.INDEX,
    deletedAt: null,
    ...overrides,
  }) as never;

const buildViewField = (overrides: Record<string, unknown>) =>
  ({
    id: 'view-field-1',
    viewId: 'view-1',
    fieldMetadataId: 'field-1',
    position: 3,
    isVisible: true,
    deletedAt: null,
    ...overrides,
  }) as never;

const buildFieldMetadata = (overrides: Record<string, unknown>) =>
  ({
    id: 'field-1',
    position: null,
    isVisibleByDefault: true,
    updatedAt: '2020-01-01T00:00:00.000Z',
    ...overrides,
  }) as never;

describe('computeFieldMetadataLayoutBackfillFromIndexViews', () => {
  it('copies position and visibility from the index view field', () => {
    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps: buildMaps([buildView({})]),
        flatViewFieldMaps: buildMaps([
          buildViewField({ position: 7, isVisible: false }),
        ]),
        flatFieldMetadataMaps: buildMaps([buildFieldMetadata({})]),
        now: NOW,
      });

    expect(flatFieldMetadatasToUpdate).toMatchObject([
      {
        id: 'field-1',
        position: 7,
        isVisibleByDefault: false,
        updatedAt: NOW,
      },
    ]);
  });

  it('skips fields that already have a position', () => {
    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps: buildMaps([buildView({})]),
        flatViewFieldMaps: buildMaps([buildViewField({})]),
        flatFieldMetadataMaps: buildMaps([
          buildFieldMetadata({ position: 12 }),
        ]),
        now: NOW,
      });

    expect(flatFieldMetadatasToUpdate).toEqual([]);
  });

  it('ignores view fields of non-index views', () => {
    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps: buildMaps([buildView({ key: null })]),
        flatViewFieldMaps: buildMaps([buildViewField({})]),
        flatFieldMetadataMaps: buildMaps([buildFieldMetadata({})]),
        now: NOW,
      });

    expect(flatFieldMetadatasToUpdate).toEqual([]);
  });

  it('ignores soft-deleted views and view fields', () => {
    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps: buildMaps([
          buildView({}),
          buildView({ id: 'view-2', deletedAt: NOW }),
        ]),
        flatViewFieldMaps: buildMaps([
          buildViewField({ deletedAt: NOW }),
          buildViewField({ id: 'view-field-2', viewId: 'view-2' }),
        ]),
        flatFieldMetadataMaps: buildMaps([buildFieldMetadata({})]),
        now: NOW,
      });

    expect(flatFieldMetadatasToUpdate).toEqual([]);
  });

  it('ignores view fields pointing at missing field metadata', () => {
    const { flatFieldMetadatasToUpdate } =
      computeFieldMetadataLayoutBackfillFromIndexViews({
        flatViewMaps: buildMaps([buildView({})]),
        flatViewFieldMaps: buildMaps([
          buildViewField({ fieldMetadataId: 'missing' }),
        ]),
        flatFieldMetadataMaps: buildMaps([buildFieldMetadata({})]),
        now: NOW,
      });

    expect(flatFieldMetadatasToUpdate).toEqual([]);
  });
});
