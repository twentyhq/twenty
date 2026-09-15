import { type ViewFilterManifest } from 'twenty-shared/application';
import { ViewFilterOperand } from 'twenty-shared/types';

import { fromFlatViewFilterToViewFilterManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-to-view-filter-manifest.util';
import { fromViewFilterManifestToUniversalFlatViewFilter } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-manifest-to-universal-flat-view-filter.util';
import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_FILTER_UID = '33333333-3333-4333-8333-333333333333';
const FIELD_UID = '44444444-4444-4444-8444-444444444444';
const RELATION_TARGET_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const VIEW_FILTER_GROUP_UID = '66666666-6666-4666-8666-666666666666';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_FILTER_MANIFEST: Required<ViewFilterManifest> = {
  universalIdentifier: VIEW_FILTER_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  operand: ViewFilterOperand.IS,
  value: ['a', 'b'],
  subFieldName: 'primaryEmail',
  relationTargetFieldMetadataUniversalIdentifier: RELATION_TARGET_FIELD_UID,
  viewFilterGroupUniversalIdentifier: VIEW_FILTER_GROUP_UID,
  positionInViewFilterGroup: 2,
};

const MINIMAL_VIEW_FILTER_MANIFEST: ViewFilterManifest = {
  universalIdentifier: VIEW_FILTER_UID,
  fieldMetadataUniversalIdentifier: FIELD_UID,
  operand: ViewFilterOperand.CONTAINS,
  value: 'x',
};

const forward = (viewFilterManifest: ViewFilterManifest) =>
  fromViewFilterManifestToUniversalFlatViewFilter({
    viewFilterManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewFilter = (flatViewFilter: UniversalFlatViewFilter) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewFilter,
    toUniversalFlatEntity: forward(
      fromFlatViewFilterToViewFilterManifest({ flatViewFilter }),
    ),
    metadataName: 'viewFilter',
  });

describe('fromFlatViewFilterToViewFilterManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: forward(VIEW_FILTER_MANIFEST),
      }),
    ).toEqual(VIEW_FILTER_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewFilter: UniversalFlatViewFilter = {
      universalIdentifier: VIEW_FILTER_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      fieldMetadataUniversalIdentifier: FIELD_UID,
      operand: ViewFilterOperand.IS_NOT,
      value: {
        selectedRecordIds: ['77777777-7777-4777-8777-777777777777'],
        isCurrentWorkspaceMemberSelected: true,
      },
      subFieldName: null,
      relationTargetFieldMetadataUniversalIdentifier: RELATION_TARGET_FIELD_UID,
      viewFilterGroupUniversalIdentifier: null,
      positionInViewFilterGroup: 1.5,
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewFilter(flatViewFilter)).toBeUndefined();
  });

  it('should omit the optional properties the forward converter nulled', () => {
    expect(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: forward(MINIMAL_VIEW_FILTER_MANIFEST),
      }),
    ).toStrictEqual(MINIMAL_VIEW_FILTER_MANIFEST);
  });

  it('should keep an object value unchanged', () => {
    const objectValue = {
      selectedRecordIds: ['77777777-7777-4777-8777-777777777777'],
      nested: { isCurrentWorkspaceMemberSelected: false, depth: 2 },
    };

    expect(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: forward({
          ...MINIMAL_VIEW_FILTER_MANIFEST,
          value: objectValue,
        }),
      }).value,
    ).toStrictEqual(objectValue);
  });

  it('should keep a boolean value unchanged', () => {
    expect(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: forward({
          ...MINIMAL_VIEW_FILTER_MANIFEST,
          value: false,
        }),
      }).value,
    ).toBe(false);
  });

  it('should write a zero position in view filter group', () => {
    expect(
      fromFlatViewFilterToViewFilterManifest({
        flatViewFilter: forward({
          ...MINIMAL_VIEW_FILTER_MANIFEST,
          positionInViewFilterGroup: 0,
        }),
      }),
    ).toHaveProperty('positionInViewFilterGroup', 0);
  });
});
