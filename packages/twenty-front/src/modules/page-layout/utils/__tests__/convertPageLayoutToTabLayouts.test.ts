import { type PageLayoutWithData } from '@/page-layout/types/pageLayoutTypes';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPersistedLayoutToTabLayouts';
import { PageLayoutType, WidgetType } from '~/generated/graphql';

describe('convertPageLayoutToTabLayouts', () => {
  it('should convert page layout to tab layouts', () => {
    const pageLayout: PageLayoutWithData = {
      id: 'page-layout-1',
      name: 'Page Layout 1',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-1',
      tabs: [
        {
          id: 'tab-1',
          title: 'Tab 1',
          position: 0,
          pageLayoutId: 'page-layout-1',
          widgets: [
            {
              id: 'widget-1',
              pageLayoutTabId: 'tab-1',
              title: 'Widget 1',
              type: WidgetType.GRAPH,
              gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
              objectMetadataId: 'object-metadata-1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null,
            },
            {
              id: 'widget-2',
              pageLayoutTabId: 'tab-1',
              title: 'Widget 2',
              type: WidgetType.GRAPH,
              gridPosition: { row: 2, column: 0, rowSpan: 2, columnSpan: 2 },
              objectMetadataId: 'object-metadata-1',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          deletedAt: null,
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      deletedAt: null,
    };

    const result = convertPageLayoutToTabLayouts(pageLayout);

    expect(result).toEqual({
      'tab-1': {
        desktop: [
          { i: 'widget-1', x: 0, y: 0, w: 2, h: 2 },
          { i: 'widget-2', x: 0, y: 2, w: 2, h: 2 },
        ],
        mobile: [
          { i: 'widget-1', x: 0, y: 0, w: 1, h: 2 },
          { i: 'widget-2', x: 0, y: 2, w: 1, h: 2 },
        ],
      },
    });
  });
});
