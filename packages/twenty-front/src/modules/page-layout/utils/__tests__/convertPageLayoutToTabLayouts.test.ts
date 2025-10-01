import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import {
  GraphOrderBy,
  GraphType,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('convertPageLayoutToTabLayouts', () => {
  it('should convert page layout to tab layouts', () => {
    const pageLayout: PageLayout = {
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
              __typename: 'PageLayoutWidget',
              id: 'widget-1',
              pageLayoutTabId: 'tab-1',
              title: 'Widget 1',
              type: WidgetType.GRAPH,
              configuration: {
                graphType: GraphType.NUMBER,
                aggregateOperation: AggregateOperations.COUNT,
                aggregateFieldMetadataId: 'id',
              },
              gridPosition: { row: 0, column: 0, rowSpan: 2, columnSpan: 2 },
              objectMetadataId: 'object-metadata-1',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              deletedAt: null,
            },
            {
              __typename: 'PageLayoutWidget',
              id: 'widget-2',
              pageLayoutTabId: 'tab-1',
              title: 'Widget 2',
              type: WidgetType.GRAPH,
              configuration: {
                graphType: GraphType.PIE,
                aggregateOperation: AggregateOperations.COUNT,
                aggregateFieldMetadataId: 'id',
                groupByFieldMetadataId: 'status',
                orderBy: GraphOrderBy.VALUE_DESC,
              },
              gridPosition: { row: 2, column: 0, rowSpan: 2, columnSpan: 2 },
              objectMetadataId: 'object-metadata-1',
              createdAt: '2025-01-01T00:00:00.000Z',
              updatedAt: '2025-01-01T00:00:00.000Z',
              deletedAt: null,
            },
          ],
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
          deletedAt: null,
        },
      ],
      createdAt: '2025-01-01T00:00:00.000Z',
      updatedAt: '2025-01-01T00:00:00.000Z',
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
