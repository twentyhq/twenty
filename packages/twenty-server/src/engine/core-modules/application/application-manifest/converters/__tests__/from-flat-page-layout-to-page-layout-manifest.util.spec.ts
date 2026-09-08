import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { fromFlatPageLayoutToPageLayoutManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-to-page-layout-manifest.util';
import { fromPageLayoutManifestToUniversalFlatPageLayout } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-manifest-to-universal-flat-page-layout.util';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const PAGE_LAYOUT_UID = '33333333-3333-4333-8333-333333333333';
const TAB_UID = '44444444-4444-4444-8444-444444444444';
const NOW = '2026-09-08T10:00:00.000Z';

const TAB_MANIFEST: PageLayoutTabManifest = {
  universalIdentifier: TAB_UID,
  title: 'Overview',
  position: 0,
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const PAGE_LAYOUT_MANIFEST: Required<Omit<PageLayoutManifest, 'tabs'>> = {
  universalIdentifier: PAGE_LAYOUT_UID,
  name: 'Pet page',
  type: 'RECORD_PAGE',
  objectUniversalIdentifier: OBJECT_UID,
  defaultTabToFocusOnMobileAndSidePanelUniversalIdentifier: TAB_UID,
};

const MINIMAL_PAGE_LAYOUT_MANIFEST: PageLayoutManifest = {
  universalIdentifier: PAGE_LAYOUT_UID,
  name: 'Pet board',
  type: 'STANDALONE_PAGE',
};

const forward = (pageLayoutManifest: PageLayoutManifest) =>
  fromPageLayoutManifestToUniversalFlatPageLayout({
    pageLayoutManifest,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatPageLayoutToPageLayoutManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatPageLayoutToPageLayoutManifest({
        flatPageLayout: forward(PAGE_LAYOUT_MANIFEST),
        tabs: [TAB_MANIFEST],
      }),
    ).toEqual({ ...PAGE_LAYOUT_MANIFEST, tabs: [TAB_MANIFEST] });
  });

  it('should omit the null slots and the empty tab list of a minimal manifest', () => {
    expect(
      fromFlatPageLayoutToPageLayoutManifest({
        flatPageLayout: forward(MINIMAL_PAGE_LAYOUT_MANIFEST),
      }),
    ).toEqual(MINIMAL_PAGE_LAYOUT_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatPageLayout = forward(PAGE_LAYOUT_MANIFEST);

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatPageLayout,
        toUniversalFlatEntity: forward(
          fromFlatPageLayoutToPageLayoutManifest({ flatPageLayout }),
        ),
        metadataName: 'pageLayout',
      }),
    ).toBeUndefined();
  });
});
