import {
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode, PageLayoutType } from 'twenty-shared/types';

import { fromFlatPageLayoutTabToPageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-page-layout-tab-manifest.util';
import { fromFlatPageLayoutTabToStandalonePageLayoutTabManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-tab-to-standalone-page-layout-tab-manifest.util';
import { fromPageLayoutTabManifestToUniversalFlatPageLayoutTab } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-tab-manifest-to-universal-flat-page-layout-tab.util';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';
import { normalizePageLayoutTabManifestOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/normalize-page-layout-tab-manifest-or-throw.test-util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const PAGE_LAYOUT_UID = '33333333-3333-4333-8333-333333333333';
const TAB_UID = '44444444-4444-4444-8444-444444444444';
const WIDGET_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-08T10:00:00.000Z';

const WIDGET_MANIFEST: PageLayoutWidgetManifest = {
  universalIdentifier: WIDGET_UID,
  title: 'Notes',
  type: 'NOTES',
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
  configuration: { configurationType: 'NOTES' },
};

const TAB_MANIFEST: Required<
  Omit<PageLayoutTabManifest, 'widgets' | 'pageLayoutUniversalIdentifier'>
> = {
  universalIdentifier: TAB_UID,
  title: 'Overview',
  position: 10,
  icon: 'IconHome',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const MINIMAL_TAB_MANIFEST: PageLayoutTabManifest = {
  universalIdentifier: TAB_UID,
  title: 'Board',
  position: 0,
};

const forward = (
  pageLayoutTabManifest: PageLayoutTabManifest,
  pageLayoutType?: PageLayoutType,
) =>
  fromPageLayoutTabManifestToUniversalFlatPageLayoutTab({
    pageLayoutTabManifest: normalizePageLayoutTabManifestOrThrow({
      pageLayoutTabManifest,
      pageLayoutType,
    }),
    pageLayoutUniversalIdentifier: PAGE_LAYOUT_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatPageLayoutTabToPageLayoutTabManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatPageLayoutTabToPageLayoutTabManifest({
        flatPageLayoutTab: forward(TAB_MANIFEST),
        widgets: [WIDGET_MANIFEST],
      }),
    ).toEqual({ ...TAB_MANIFEST, widgets: [WIDGET_MANIFEST] });
  });

  it('should write the layout mode the forward converter applied to a minimal manifest', () => {
    expect(
      fromFlatPageLayoutTabToPageLayoutTabManifest({
        flatPageLayoutTab: forward(MINIMAL_TAB_MANIFEST),
      }),
    ).toEqual({
      ...MINIMAL_TAB_MANIFEST,
      layoutMode: PageLayoutTabLayoutMode.GRID,
    });
    expect(
      fromFlatPageLayoutTabToPageLayoutTabManifest({
        flatPageLayoutTab: forward(
          MINIMAL_TAB_MANIFEST,
          PageLayoutType.STANDALONE_PAGE,
        ),
      }),
    ).toEqual({
      ...MINIMAL_TAB_MANIFEST,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
    });
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatPageLayoutTab = forward(TAB_MANIFEST);

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatPageLayoutTab,
        toUniversalFlatEntity: forward(
          fromFlatPageLayoutTabToPageLayoutTabManifest({ flatPageLayoutTab }),
        ),
        metadataName: 'pageLayoutTab',
      }),
    ).toBeUndefined();
  });

  it('should add the page layout identifier right after the universal identifier of a standalone tab', () => {
    expect(
      Object.entries(
        fromFlatPageLayoutTabToStandalonePageLayoutTabManifest({
          flatPageLayoutTab: forward(TAB_MANIFEST),
        }),
      ).slice(0, 2),
    ).toEqual([
      ['universalIdentifier', TAB_UID],
      ['pageLayoutUniversalIdentifier', PAGE_LAYOUT_UID],
    ]);
  });
});
