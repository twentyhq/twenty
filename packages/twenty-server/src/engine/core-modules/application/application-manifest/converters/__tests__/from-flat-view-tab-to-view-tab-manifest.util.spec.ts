import { type ViewTabManifest } from 'twenty-shared/application';
import { ViewTabType } from 'twenty-shared/types';

import { fromFlatViewTabToViewTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-view-tab-to-view-tab-manifest.util';
import { fromViewTabManifestToUniversalFlatViewTab } from 'src/engine/core-modules/application/application-manifest/converters/from-view-tab-manifest-to-universal-flat-view-tab.util';
import { type UniversalFlatViewTab } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-tab.type';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const VIEW_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_TAB_UID = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-09-03T10:00:00.000Z';

const FIELD_VALUE_VIEW_TAB_MANIFEST: ViewTabManifest = {
  universalIdentifier: VIEW_TAB_UID,
  type: ViewTabType.FIELD_VALUE,
  fieldValue: 'won',
  isVisible: false,
  position: 4,
};

const CUSTOM_VIEW_TAB_MANIFEST: ViewTabManifest = {
  universalIdentifier: VIEW_TAB_UID,
  type: ViewTabType.CUSTOM,
  name: 'Big deals',
  isVisible: true,
  position: 1,
};

const forward = (viewTabManifest: ViewTabManifest) =>
  fromViewTabManifestToUniversalFlatViewTab({
    viewTabManifest,
    viewUniversalIdentifier: VIEW_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

const roundTripFlatViewTab = (flatViewTab: UniversalFlatViewTab) =>
  compareTwoFlatEntity({
    fromUniversalFlatEntity: flatViewTab,
    toUniversalFlatEntity: forward(
      fromFlatViewTabToViewTabManifest({ flatViewTab }),
    ),
    metadataName: 'viewTab',
  });

describe('fromFlatViewTabToViewTabManifest', () => {
  it.each([
    ['field value', FIELD_VALUE_VIEW_TAB_MANIFEST],
    ['custom', CUSTOM_VIEW_TAB_MANIFEST],
  ])(
    'should reproduce a %s tab manifest after a forward then an inverse conversion',
    (_title, viewTabManifest) => {
      expect(
        fromFlatViewTabToViewTabManifest({
          flatViewTab: forward(viewTabManifest),
        }),
      ).toEqual(viewTabManifest);
    },
  );

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatViewTab: UniversalFlatViewTab = {
      universalIdentifier: VIEW_TAB_UID,
      applicationUniversalIdentifier: APP_UID,
      viewUniversalIdentifier: VIEW_UID,
      type: ViewTabType.ALL,
      fieldValue: null,
      name: null,
      isVisible: false,
      position: 0,
      viewFilterUniversalIdentifiers: [],
      createdAt: NOW,
      updatedAt: NOW,
      deletedAt: null,
    };

    expect(roundTripFlatViewTab(flatViewTab)).toBeUndefined();
  });

  it('should write the visibility the forward converter defaulted', () => {
    const { isVisible: _isVisible, ...manifestWithoutVisibility } =
      FIELD_VALUE_VIEW_TAB_MANIFEST;

    expect(
      fromFlatViewTabToViewTabManifest({
        flatViewTab: forward(manifestWithoutVisibility),
      }),
    ).toStrictEqual({ ...manifestWithoutVisibility, isVisible: true });
  });
});
