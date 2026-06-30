import { DEFAULT_WIDGET_SIZE } from 'twenty-shared/constants';
import { WIDGET_SIZES } from '@/page-layout/constants/WidgetSizes';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { convertPageLayoutToTabLayouts } from '@/page-layout/utils/convertPageLayoutToTabLayouts';
import {
  AggregateOperations,
  GraphOrderBy,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('convertPageLayoutToTabLayouts', () => {
  it('should convert page layout to tab layouts', () => {
    const pageLayout: PageLayout = {
      id: 'page-layout-1',
      name: 'Page Layout 1',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-1',
      universalIdentifier: '20202020-0000-0000-0000-000000000001',
      tabs: [
        {
          id: 'tab-1',
          applicationId: '',
          isActive: true,
          title: 'Tab 1',
          position: 0,
          pageLayoutId: 'page-layout-1',
          widgets: [
            {
              __typename: 'PageLayoutWidget',
              id: 'widget-1',
              applicationId: '',
              isActive: true,
              pageLayoutTabId: 'tab-1',
              title: 'Widget 1',
              type: WidgetType.GRAPH,
              configuration: {
                configurationType: WidgetConfigurationType.AGGREGATE_CHART,
                aggregateOperation: AggregateOperations.COUNT,
                aggregateFieldMetadataId: 'id',
                displayDataLabel: false,
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
              applicationId: '',
              isActive: true,
              pageLayoutTabId: 'tab-1',
              title: 'Widget 2',
              type: WidgetType.GRAPH,
              configuration: {
                configurationType: WidgetConfigurationType.PIE_CHART,
                aggregateOperation: AggregateOperations.COUNT,
                aggregateFieldMetadataId: 'id',
                groupByFieldMetadataId: 'status',
                orderBy: GraphOrderBy.VALUE_DESC,
                displayDataLabel: false,
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
          { i: 'widget-1', x: 0, y: 0, w: 2, h: 2, minW: 2, minH: 2 },
          { i: 'widget-2', x: 0, y: 2, w: 2, h: 2, minW: 3, minH: 4 },
        ],
        mobile: [
          { i: 'widget-1', x: 0, y: 0, w: 1, h: 2, minW: 2, minH: 2 },
          { i: 'widget-2', x: 0, y: 2, w: 1, h: 2, minW: 3, minH: 4 },
        ],
      },
    });
  });

  it('should use default widget size when gridPosition is undefined', () => {
    const pageLayout: PageLayout = {
      id: 'page-layout-1',
      name: 'Page Layout 1',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-1',
      universalIdentifier: '20202020-0000-0000-0000-000000000001',
      tabs: [
        {
          id: 'tab-1',
          applicationId: '',
          isActive: true,
          title: 'Tab 1',
          position: 0,
          pageLayoutId: 'page-layout-1',
          widgets: [
            {
              __typename: 'PageLayoutWidget',
              id: 'widget-no-grid-pos',
              applicationId: '',
              isActive: true,
              pageLayoutTabId: 'tab-1',
              title: 'No Grid Position',
              type: WidgetType.FRONT_COMPONENT,
              configuration: {
                configurationType: WidgetConfigurationType.FRONT_COMPONENT,
                frontComponentId: 'my-component',
              },
              gridPosition: undefined as any,
              position: {
                __typename: 'PageLayoutWidgetCanvasPosition' as const,
                layoutMode: PageLayoutTabLayoutMode.CANVAS,
              },
              objectMetadataId: null,
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

    expect(result['tab-1'].desktop[0]).toMatchObject({
      i: 'widget-no-grid-pos',
      x: 0,
      y: 0,
      w: DEFAULT_WIDGET_SIZE.default.w,
      h: DEFAULT_WIDGET_SIZE.default.h,
    });
  });

  it('should apply STANDALONE_RICH_TEXT minimum size constraints', () => {
    const pageLayout: PageLayout = {
      id: 'page-layout-1',
      name: 'Page Layout 1',
      type: PageLayoutType.RECORD_PAGE,
      objectMetadataId: 'object-metadata-1',
      universalIdentifier: '20202020-0000-0000-0000-000000000001',
      tabs: [
        {
          id: 'tab-1',
          applicationId: '',
          isActive: true,
          title: 'Tab 1',
          position: 0,
          pageLayoutId: 'page-layout-1',
          widgets: [
            {
              __typename: 'PageLayoutWidget',
              id: 'rich-text-widget',
              applicationId: '',
              isActive: true,
              pageLayoutTabId: 'tab-1',
              title: 'Rich Text',
              type: WidgetType.STANDALONE_RICH_TEXT,
              configuration: {
                configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
                body: { blocknote: '[]' },
              },
              gridPosition: { row: 0, column: 0, rowSpan: 4, columnSpan: 4 },
              objectMetadataId: null,
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
    const richTextMinSize =
      WIDGET_SIZES[WidgetType.STANDALONE_RICH_TEXT]!.minimum;

    expect(result['tab-1'].desktop[0]).toMatchObject({
      i: 'rich-text-widget',
      minW: richTextMinSize.w,
      minH: richTextMinSize.h,
    });
  });
});
