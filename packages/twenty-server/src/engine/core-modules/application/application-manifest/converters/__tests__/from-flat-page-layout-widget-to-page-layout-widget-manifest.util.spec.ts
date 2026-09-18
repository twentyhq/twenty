import { type PageLayoutWidgetManifest } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { fromFlatPageLayoutWidgetToPageLayoutWidgetManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-page-layout-widget-to-page-layout-widget-manifest.util';
import { fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget } from 'src/engine/core-modules/application/application-manifest/converters/from-page-layout-widget-manifest-to-universal-flat-page-layout-widget.util';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';
import { normalizePageLayoutTabManifestOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/__tests__/normalize-page-layout-tab-manifest-or-throw.test-util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const VIEW_UID = '33333333-3333-4333-8333-333333333333';
const TAB_UID = '44444444-4444-4444-8444-444444444444';
const WIDGET_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-08T10:00:00.000Z';

const WIDGET_MANIFEST: Required<
  Omit<PageLayoutWidgetManifest, 'heightBehavior'>
> = {
  universalIdentifier: WIDGET_UID,
  title: 'Fields',
  type: 'FIELDS',
  objectUniversalIdentifier: OBJECT_UID,
  conditionalDisplay: { device: 'DESKTOP' },
  position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 2 },
  configuration: {
    configurationType: 'FIELDS',
    viewUniversalIdentifier: VIEW_UID,
    newFieldDefaultVisibility: true,
  },
};

const MINIMAL_WIDGET_MANIFEST: PageLayoutWidgetManifest = {
  universalIdentifier: WIDGET_UID,
  title: 'Notes',
  type: 'NOTES',
  configuration: { configurationType: 'NOTES' },
};

const forward = (
  pageLayoutWidgetManifest: PageLayoutWidgetManifest,
  pageLayoutTabLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
) =>
  fromPageLayoutWidgetManifestToUniversalFlatPageLayoutWidget({
    pageLayoutWidgetManifest: normalizePageLayoutTabManifestOrThrow({
      pageLayoutTabManifest: {
        universalIdentifier: TAB_UID,
        title: 'Overview',
        position: 0,
        layoutMode: pageLayoutTabLayoutMode,
        widgets: [pageLayoutWidgetManifest],
      },
      pageLayoutType: undefined,
    }).widgets[0],
    pageLayoutTabUniversalIdentifier: TAB_UID,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatPageLayoutWidgetToPageLayoutWidgetManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
        flatPageLayoutWidget: forward(WIDGET_MANIFEST),
      }),
    ).toEqual(WIDGET_MANIFEST);
  });

  it('should write the position the forward converter derived from the tab for a minimal manifest', () => {
    expect(
      fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
        flatPageLayoutWidget: forward(MINIMAL_WIDGET_MANIFEST),
      }),
    ).toEqual({
      ...MINIMAL_WIDGET_MANIFEST,
      position: { layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST, index: 0 },
    });
    expect(
      fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
        flatPageLayoutWidget: forward(
          MINIMAL_WIDGET_MANIFEST,
          PageLayoutTabLayoutMode.GRID,
        ),
      }).position,
    ).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 0,
      column: 0,
      rowSpan: 4,
      columnSpan: 4,
    });
  });

  it('should keep an explicit null view reference inside the configuration', () => {
    const viewlessFieldsWidgetManifest: PageLayoutWidgetManifest = {
      ...MINIMAL_WIDGET_MANIFEST,
      type: 'FIELDS',
      configuration: {
        configurationType: 'FIELDS',
        viewUniversalIdentifier: null,
        newFieldDefaultVisibility: true,
      },
    };

    expect(
      fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
        flatPageLayoutWidget: forward(viewlessFieldsWidgetManifest),
      }).configuration,
    ).toEqual(viewlessFieldsWidgetManifest.configuration);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion', () => {
    const flatPageLayoutWidget = forward(WIDGET_MANIFEST);

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatPageLayoutWidget,
        toUniversalFlatEntity: forward(
          fromFlatPageLayoutWidgetToPageLayoutWidgetManifest({
            flatPageLayoutWidget,
          }),
        ),
        metadataName: 'pageLayoutWidget',
      }),
    ).toBeUndefined();
  });
});
