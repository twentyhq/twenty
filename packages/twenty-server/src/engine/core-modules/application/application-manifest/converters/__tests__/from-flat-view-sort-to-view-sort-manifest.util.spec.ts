import { type ViewSortManifest } from 'twenty-shared/application';
import { ViewSortDirection } from 'twenty-shared/types';

import { fromFlatViewSortToViewSortManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-sort-to-view-sort-manifest.util';
import { fromViewSortManifestToUniversalFlatViewSort } from 'src/engine/core-modules/application/application-manifest/converters/from-view-sort-manifest-to-universal-flat-view-sort.util';
import { type UniversalFlatViewSort } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-sort.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_SORT_UID = '33333333-3333-4333-8333-333333333333';
const FIELD_UID = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_SORT_MANIFEST: Required<ViewSortManifest> = {
  universalIdentifier: VIEW_SORT_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  direction: ViewSortDirection.DESC,
  subFieldName: 'amountMicros',
};

const forward = (viewSortManifest: ViewSortManifest) =>
  fromViewSortManifestToUniversalFlatViewSort({
    viewSortManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewSort = (flatViewSort: UniversalFlatViewSort) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewSort,
    toUniversalFlatEntity: forward(
      fromFlatViewSortToViewSortManifest({ flatViewSort }),
    ),
    metadataName: 'viewSort',
  });

describe('fromFlatViewSortToViewSortManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewSortToViewSortManifest({
        flatViewSort: forward(VIEW_SORT_MANIFEST),
      }),
    ).toEqual(VIEW_SORT_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewSort: UniversalFlatViewSort = {
      universalIdentifier: VIEW_SORT_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      fieldMetadataUniversalIdentifier: FIELD_UID,
      direction: ViewSortDirection.ASC,
      subFieldName: null,
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewSort(flatViewSort)).toBeUndefined();
  });

  it('should omit the sub field name of a sort stored without one', () => {
    const { subFieldName: _subFieldName, ...manifestWithoutSubFieldName } =
      VIEW_SORT_MANIFEST;

    expect(
      fromFlatViewSortToViewSortManifest({
        flatViewSort: forward(manifestWithoutSubFieldName),
      }),
    ).toStrictEqual(manifestWithoutSubFieldName);
  });
});
