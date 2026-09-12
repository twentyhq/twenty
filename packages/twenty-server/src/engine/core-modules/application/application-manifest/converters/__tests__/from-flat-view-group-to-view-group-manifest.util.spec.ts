import { type ViewGroupManifest } from 'twenty-shared/application';

import { fromFlatViewGroupToViewGroupManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-group-to-view-group-manifest.util';
import { fromViewGroupManifestToUniversalFlatViewGroup } from 'src/engine/core-modules/application/application-manifest/converters/from-view-group-manifest-to-universal-flat-view-group.util';
import { type UniversalFlatViewGroup } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-group.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_GROUP_UID = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-09-03T10:00:00.000Z';

const VIEW_GROUP_MANIFEST: Required<ViewGroupManifest> = {
  universalIdentifier: VIEW_GROUP_UID,
  fieldValue: 'won',
  isVisible: false,
  position: 4,
};

const forward = (viewGroupManifest: ViewGroupManifest) =>
  fromViewGroupManifestToUniversalFlatViewGroup({
    viewGroupManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewGroup = (flatViewGroup: UniversalFlatViewGroup) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewGroup,
    toUniversalFlatEntity: forward(
      fromFlatViewGroupToViewGroupManifest({ flatViewGroup }),
    ),
    metadataName: 'viewGroup',
  });

describe('fromFlatViewGroupToViewGroupManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatViewGroupToViewGroupManifest({
        flatViewGroup: forward(VIEW_GROUP_MANIFEST),
      }),
    ).toEqual(VIEW_GROUP_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewGroup: UniversalFlatViewGroup = {
      universalIdentifier: VIEW_GROUP_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      fieldValue: '',
      isVisible: false,
      position: 0,
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewGroup(flatViewGroup)).toBeUndefined();
  });

  it('should write the visibility the forward converter defaulted', () => {
    const { isVisible: _isVisible, ...manifestWithoutVisibility } =
      VIEW_GROUP_MANIFEST;

    expect(
      fromFlatViewGroupToViewGroupManifest({
        flatViewGroup: forward(manifestWithoutVisibility),
      }),
    ).toStrictEqual({ ...manifestWithoutVisibility, isVisible: true });
  });
});
