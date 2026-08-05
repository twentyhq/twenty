import { addMissingPageLayoutWidgetPositions } from '@/cli/utilities/build/manifest/utils/add-missing-page-layout-widget-positions';
import {
  type PageLayoutManifest,
  type PageLayoutTabManifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

const PAGE_LAYOUT_UNIVERSAL_IDENTIFIER =
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa';

const buildWidget = (
  universalIdentifier: string,
  overrides: Partial<PageLayoutWidgetManifest> = {},
): PageLayoutWidgetManifest => ({
  universalIdentifier,
  title: 'Widget',
  type: 'FRONT_COMPONENT',
  configuration: {
    configurationType: 'FRONT_COMPONENT',
    frontComponentUniversalIdentifier: 'cccccccc-cccc-4ccc-cccc-cccccccccccc',
  },
  ...overrides,
});

const buildPageLayout = (
  tabs: PageLayoutTabManifest[],
  type: PageLayoutManifest['type'] = 'RECORD_PAGE',
): PageLayoutManifest => ({
  universalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
  name: 'Example Record Page',
  type,
  tabs,
});

const buildTab = (
  overrides: Partial<PageLayoutTabManifest> = {},
): PageLayoutTabManifest => ({
  universalIdentifier: 'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',
  title: 'Hello World',
  position: 50,
  ...overrides,
});

describe('addMissingPageLayoutWidgetPositions', () => {
  it('should index vertical list widgets in declaration order', () => {
    const { pageLayouts } = addMissingPageLayoutWidgetPositions({
      pageLayouts: [
        buildPageLayout([
          buildTab({
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            widgets: [buildWidget('widget-1'), buildWidget('widget-2')],
          }),
        ]),
      ],
      pageLayoutTabs: [],
    });

    expect(pageLayouts[0].tabs?.[0].widgets).toEqual([
      expect.objectContaining({
        universalIdentifier: 'widget-1',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 0,
        },
      }),
      expect.objectContaining({
        universalIdentifier: 'widget-2',
        position: {
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          index: 1,
        },
      }),
    ]);
  });

  it('should mirror the grid position for grid widgets', () => {
    const { pageLayouts } = addMissingPageLayoutWidgetPositions({
      pageLayouts: [
        buildPageLayout([
          buildTab({
            layoutMode: PageLayoutTabLayoutMode.GRID,
            widgets: [
              buildWidget('widget-1', {
                gridPosition: { row: 2, column: 6, rowSpan: 4, columnSpan: 6 },
              }),
            ],
          }),
        ]),
      ],
      pageLayoutTabs: [],
    });

    expect(pageLayouts[0].tabs?.[0].widgets?.[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.GRID,
      row: 2,
      column: 6,
      rowSpan: 4,
      columnSpan: 6,
    });
  });

  it('should keep an explicitly declared position', () => {
    const { pageLayouts } = addMissingPageLayoutWidgetPositions({
      pageLayouts: [
        buildPageLayout([
          buildTab({
            layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
            widgets: [
              buildWidget('widget-1', {
                position: {
                  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
                  index: 42,
                },
              }),
            ],
          }),
        ]),
      ],
      pageLayoutTabs: [],
    });

    expect(pageLayouts[0].tabs?.[0].widgets?.[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 42,
    });
  });

  it('should resolve the layout mode of a standalone tab from the layout it targets', () => {
    const { pageLayoutTabs } = addMissingPageLayoutWidgetPositions({
      pageLayouts: [buildPageLayout([], 'STANDALONE_PAGE')],
      pageLayoutTabs: [
        buildTab({
          pageLayoutUniversalIdentifier: PAGE_LAYOUT_UNIVERSAL_IDENTIFIER,
          widgets: [buildWidget('widget-1')],
        }),
      ],
    });

    expect(pageLayoutTabs[0].widgets?.[0].position).toEqual({
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index: 0,
    });
  });
});
