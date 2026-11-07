import { transformPageLayout } from '@/page-layout/utils/transformPageLayout';
import {
  AggregateOperations,
  type PageLayout,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
} from '~/generated-metadata/graphql';

const makePageLayout = (overrides: Partial<PageLayout> = {}): PageLayout =>
  ({
    __typename: 'PageLayout',
    id: 'layout-1',
    name: 'Test Layout',
    type: PageLayoutType.RECORD_PAGE,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    tabs: [],
    ...overrides,
  }) as PageLayout;

describe('transformPageLayout', () => {
  it('should default tabs to empty array when null', () => {
    const layout = makePageLayout({ tabs: null as any });

    const result = transformPageLayout(layout);

    expect(result.tabs).toEqual([]);
  });

  it('should sort tabs by position', () => {
    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-2',
          position: 2,
          title: 'Second',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
        {
          id: 'tab-1',
          position: 1,
          title: 'First',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].id).toBe('tab-1');
    expect(result.tabs[1].id).toBe('tab-2');
  });

  it('should default widgets to empty array when null', () => {
    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-1',
          position: 0,
          title: 'Tab',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: null,
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].widgets).toEqual([]);
  });

  it('should preserve existing widgets', () => {
    const widget = {
      id: 'w1',
      title: 'Widget',
      type: 'FIELDS',
      configuration: {
        __typename: 'FieldsConfiguration',
        configurationType: WidgetConfigurationType.FIELDS,
      },
    };

    const layout = makePageLayout({
      tabs: [
        {
          id: 'tab-1',
          position: 0,
          title: 'Tab',
          pageLayoutId: 'layout-1',
          applicationId: 'app-1',
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgets: [widget],
          createdAt: '2025-01-01',
          updatedAt: '2025-01-01',
        },
      ] as any,
    });

    const result = transformPageLayout(layout);

    expect(result.tabs[0].widgets).toHaveLength(1);
    expect(result.tabs[0].widgets[0].id).toBe('w1');
  });

  it('should drop the nulls GraphQL returns for unset settings, except on settings the configuration type allows to be null', () => {
    const makeTabWithWidgetConfigurations = (
      configurations: Record<string, unknown>[],
    ) => ({
      id: 'tab-1',
      position: 0,
      title: 'Tab',
      pageLayoutId: 'layout-1',
      applicationId: 'app-1',
      layoutMode: PageLayoutTabLayoutMode.GRID,
      widgets: configurations.map((configuration, index) => ({
        id: `w${index}`,
        title: 'Widget',
        type: 'GRAPH',
        configuration,
      })),
      createdAt: '2025-01-01',
      updatedAt: '2025-01-01',
    });

    const layout = makePageLayout({
      tabs: [
        makeTabWithWidgetConfigurations([
          {
            __typename: 'AggregateChartConfiguration',
            configurationType: WidgetConfigurationType.AGGREGATE_CHART,
            aggregateFieldMetadataId: 'field-1',
            aggregateOperation: AggregateOperations.COUNT,
            label: null,
          },
          {
            __typename: 'RecordTableConfiguration',
            configurationType: WidgetConfigurationType.RECORD_TABLE,
            viewId: null,
            recordLimit: null,
          },
          {
            __typename: 'FieldConfiguration',
            configurationType: WidgetConfigurationType.FIELD,
            fieldMetadataId: 'field-2',
            fieldDisplayMode: 'FIELD',
            viewId: null,
            nestedRelationFieldMetadataId: null,
          },
        ]),
      ] as unknown as PageLayout['tabs'],
    });

    const result = transformPageLayout(layout);

    expect(
      result.tabs[0].widgets.map((widget) => widget.configuration),
    ).toEqual([
      {
        __typename: 'AggregateChartConfiguration',
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
        aggregateFieldMetadataId: 'field-1',
        aggregateOperation: AggregateOperations.COUNT,
      },
      {
        __typename: 'RecordTableConfiguration',
        configurationType: WidgetConfigurationType.RECORD_TABLE,
        viewId: null,
      },
      {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId: 'field-2',
        fieldDisplayMode: 'FIELD',
        nestedRelationFieldMetadataId: null,
      },
    ]);
  });
});
