import { type ViewFilterGroupManifest } from 'twenty-shared/application';
import { ViewFilterGroupLogicalOperator } from 'twenty-shared/types';

import { fromFlatViewFilterGroupToViewFilterGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-filter-group-to-view-filter-group-manifest.util';
import { fromViewFilterGroupManifestToUniversalFlatViewFilterGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-filter-group-manifest-to-universal-flat-view-filter-group.util';
import { type UniversalFlatViewFilterGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter-group.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_FILTER_GROUP_UID = '33333333-3333-4333-8333-333333333333';
const PARENT_VIEW_FILTER_GROUP_UID = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_FILTER_GROUP_MANIFEST: Required<ViewFilterGroupManifest> = {
  universalIdentifier: VIEW_FILTER_GROUP_UID,
  logicalOperator: ViewFilterGroupLogicalOperator.NOT,
  parentViewFilterGroupUniversalIdentifier: PARENT_VIEW_FILTER_GROUP_UID,
  positionInViewFilterGroup: 1,
};

const forward = (viewFilterGroupManifest: ViewFilterGroupManifest) =>
  fromViewFilterGroupManifestToUniversalFlatViewFilterGroup({
    viewFilterGroupManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewFilterGroup = (
  flatViewFilterGroup: UniversalFlatViewFilterGroup,
) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewFilterGroup,
    toUniversalFlatEntity: forward(
      fromFlatViewFilterGroupToViewFilterGroupManifest({ flatViewFilterGroup }),
    ),
    metadataName: 'viewFilterGroup',
  });

describe('fromFlatViewFilterGroupToViewFilterGroupManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewFilterGroupToViewFilterGroupManifest({
        flatViewFilterGroup: forward(VIEW_FILTER_GROUP_MANIFEST),
      }),
    ).toEqual(VIEW_FILTER_GROUP_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewFilterGroup: UniversalFlatViewFilterGroup = {
      universalIdentifier: VIEW_FILTER_GROUP_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      parentViewFilterGroupUniversalIdentifier: null,
      logicalOperator: ViewFilterGroupLogicalOperator.OR,
      positionInViewFilterGroup: null,
      childViewFilterGroupUniversalIdentifiers: [],
      viewFilterUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewFilterGroup(flatViewFilterGroup)).toBeUndefined();
  });

  it('should omit the parent group and the position of a root group', () => {
    const {
      parentViewFilterGroupUniversalIdentifier:
        _parentViewFilterGroupUniversalIdentifier,
      positionInViewFilterGroup: _positionInViewFilterGroup,
      ...rootGroupManifest
    } = VIEW_FILTER_GROUP_MANIFEST;

    expect(
      fromFlatViewFilterGroupToViewFilterGroupManifest({
        flatViewFilterGroup: forward(rootGroupManifest),
      }),
    ).toStrictEqual(rootGroupManifest);
  });

  it('should keep a zero position inside the parent group', () => {
    const firstChildGroupManifest: Required<ViewFilterGroupManifest> = {
      ...VIEW_FILTER_GROUP_MANIFEST,
      positionInViewFilterGroup: 0,
    };

    expect(
      fromFlatViewFilterGroupToViewFilterGroupManifest({
        flatViewFilterGroup: forward(firstChildGroupManifest),
      }),
    ).toEqual(firstChildGroupManifest);
  });
});
