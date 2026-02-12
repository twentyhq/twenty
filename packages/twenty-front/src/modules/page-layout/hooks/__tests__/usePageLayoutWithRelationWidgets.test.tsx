import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useFieldListFieldMetadataItems } from '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems';
import { usePageLayoutWithRelationWidgets } from '@/page-layout/hooks/usePageLayoutWithRelationWidgets';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { useLayoutRenderingContext } from '@/ui/layout/contexts/LayoutRenderingContext';
import { renderHook } from '@testing-library/react';
import {
  AggregateOperations,
  BarChartLayout,
  GraphOrderBy,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

jest.mock('@/ui/layout/contexts/LayoutRenderingContext');
jest.mock(
  '@/object-record/record-field-list/hooks/useFieldListFieldMetadataItems',
);

describe('usePageLayoutWithRelationWidgets', () => {
  const mockBasePageLayout: PageLayout = {
    __typename: 'PageLayout',
    id: 'test-layout',
    name: 'Test Layout',
    type: PageLayoutType.RECORD_PAGE,
    objectMetadataId: 'obj-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
    tabs: [
      {
        __typename: 'PageLayoutTab',
        id: 'tab-1',
        title: 'Fields',
        icon: 'IconList',
        position: 100,
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        pageLayoutId: 'test-layout',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        widgets: [
          {
            __typename: 'PageLayoutWidget',
            id: 'widget-fields',
            pageLayoutTabId: 'tab-1',
            title: 'Fields',
            type: WidgetType.FIELDS,
            objectMetadataId: null,
            gridPosition: {
              __typename: 'GridPosition',
              row: 0,
              column: 0,
              rowSpan: 1,
              columnSpan: 12,
            },
            configuration: {
              __typename: 'FieldsConfiguration',
              configurationType: WidgetConfigurationType.FIELDS,
              sections: [],
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            __typename: 'PageLayoutWidget',
            id: 'widget-notes',
            pageLayoutTabId: 'tab-1',
            title: 'Notes',
            type: WidgetType.NOTES,
            objectMetadataId: null,
            gridPosition: {
              __typename: 'GridPosition',
              row: 1,
              column: 0,
              rowSpan: 1,
              columnSpan: 12,
            },
            configuration: {
              __typename: 'NotesConfiguration',
              configurationType: WidgetConfigurationType.NOTES,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
          {
            __typename: 'PageLayoutWidget',
            id: 'widget-other',
            pageLayoutTabId: 'tab-1',
            title: 'Other',
            type: WidgetType.GRAPH,
            objectMetadataId: null,
            gridPosition: {
              __typename: 'GridPosition',
              row: 2,
              column: 0,
              rowSpan: 1,
              columnSpan: 12,
            },
            configuration: {
              __typename: 'BarChartConfiguration',
              configurationType: WidgetConfigurationType.BAR_CHART,
              layout: BarChartLayout.VERTICAL,
              aggregateOperation: AggregateOperations.COUNT,
              aggregateFieldMetadataId: 'id',
              primaryAxisGroupByFieldMetadataId: 'createdAt',
              primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
              displayDataLabel: false,
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            deletedAt: null,
          },
        ],
      },
    ],
  };

  const mockRelationFields: FieldMetadataItem[] = [
    {
      id: 'field-1',
      label: 'Related Companies',
      name: 'relatedCompanies',
      type: 'RELATION',
      isNullable: true,
      isActive: true,
      isSystem: false,
      isCustom: false,
      defaultValue: null,
      options: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromRelationMetadata: null,
      toRelationMetadata: null,
      relationDefinition: null,
      settings: null,
    } as FieldMetadataItem,
    {
      id: 'field-2',
      label: 'Related People',
      name: 'relatedPeople',
      type: 'RELATION',
      isNullable: true,
      isActive: true,
      isSystem: false,
      isCustom: false,
      defaultValue: null,
      options: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fromRelationMetadata: null,
      toRelationMetadata: null,
      relationDefinition: null,
      settings: null,
    } as FieldMetadataItem,
  ];

  beforeEach(() => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: {
        targetObjectNameSingular: 'company',
      },
      layoutType: PageLayoutType.RECORD_PAGE,
    });

    (useFieldListFieldMetadataItems as jest.Mock).mockReturnValue({
      boxedRelationFieldMetadataItems: mockRelationFields,
    });
  });

  it('should inject relation widgets after the first FIELDS widget', () => {
    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(mockBasePageLayout),
    );

    const firstTab = result.current?.tabs[0];
    expect(firstTab).toBeDefined();

    const widgets = firstTab?.widgets || [];
    expect(widgets.length).toBe(5); // 1 FIELDS + 2 relation + 1 NOTES + 1 OTHER

    // First widget should be FIELDS
    expect(widgets[0].type).toBe(WidgetType.FIELDS);
    expect(widgets[0].id).toBe('widget-fields');

    // Next two should be relation widgets
    expect(widgets[1].type).toBe(WidgetType.FIELD);
    expect(widgets[1].title).toBe('Related Companies');
    expect(widgets[2].type).toBe(WidgetType.FIELD);
    expect(widgets[2].title).toBe('Related People');

    // Then NOTES widget
    expect(widgets[3].type).toBe(WidgetType.NOTES);
    expect(widgets[3].id).toBe('widget-notes');

    // Finally OTHER widget
    expect(widgets[4].type).toBe(WidgetType.GRAPH);
    expect(widgets[4].id).toBe('widget-other');
  });

  it('should handle layout with no FIELDS widget by appending to end', () => {
    const layoutWithoutFields: PageLayout = {
      ...mockBasePageLayout,
      tabs: [
        {
          ...mockBasePageLayout.tabs[0],
          widgets: [
            {
              __typename: 'PageLayoutWidget',
              id: 'widget-other',
              pageLayoutTabId: 'tab-1',
              title: 'Other',
              type: WidgetType.GRAPH,
              objectMetadataId: null,
              gridPosition: {
                __typename: 'GridPosition',
                row: 0,
                column: 0,
                rowSpan: 1,
                columnSpan: 12,
              },
              configuration: {
                __typename: 'BarChartConfiguration',
                configurationType: WidgetConfigurationType.BAR_CHART,
                layout: BarChartLayout.VERTICAL,
                aggregateOperation: AggregateOperations.COUNT,
                aggregateFieldMetadataId: 'id',
                primaryAxisGroupByFieldMetadataId: 'createdAt',
                primaryAxisOrderBy: GraphOrderBy.FIELD_ASC,
                displayDataLabel: false,
              },
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              deletedAt: null,
            },
          ],
        },
      ],
    };

    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(layoutWithoutFields),
    );

    const firstTab = result.current?.tabs[0];
    const widgets = firstTab?.widgets || [];

    expect(widgets.length).toBe(3); // 1 OTHER + 2 relation
    expect(widgets[0].type).toBe(WidgetType.GRAPH);
    expect(widgets[1].type).toBe(WidgetType.FIELD);
    expect(widgets[2].type).toBe(WidgetType.FIELD);
  });

  it('should return unchanged layout when no relation fields exist', () => {
    (useFieldListFieldMetadataItems as jest.Mock).mockReturnValue({
      boxedRelationFieldMetadataItems: [],
    });

    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(mockBasePageLayout),
    );

    expect(result.current).toEqual(mockBasePageLayout);
  });

  it('should return undefined when basePageLayout is undefined', () => {
    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(undefined),
    );

    expect(result.current).toBeUndefined();
  });

  it('should return unchanged layout when not a record page', () => {
    (useLayoutRenderingContext as jest.Mock).mockReturnValue({
      targetRecordIdentifier: {
        targetObjectNameSingular: 'company',
      },
      layoutType: PageLayoutType.DASHBOARD,
    });

    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(mockBasePageLayout),
    );

    expect(result.current).toEqual(mockBasePageLayout);
  });

  it('should handle layout without Note widget', () => {
    const layoutWithoutNotes: PageLayout = {
      ...mockBasePageLayout,
      tabs: [
        {
          ...mockBasePageLayout.tabs[0],
          widgets: [
            mockBasePageLayout.tabs[0].widgets[0], // FIELDS widget
            mockBasePageLayout.tabs[0].widgets[2], // OTHER widget
          ],
        },
      ],
    };

    const { result } = renderHook(() =>
      usePageLayoutWithRelationWidgets(layoutWithoutNotes),
    );

    const firstTab = result.current?.tabs[0];
    const widgets = firstTab?.widgets || [];

    expect(widgets.length).toBe(4); // 1 FIELDS + 2 relation + 1 OTHER

    expect(widgets[0].type).toBe(WidgetType.FIELDS);
    expect(widgets[1].type).toBe(WidgetType.FIELD);
    expect(widgets[2].type).toBe(WidgetType.FIELD);
    expect(widgets[3].type).toBe(WidgetType.GRAPH);
  });
});
