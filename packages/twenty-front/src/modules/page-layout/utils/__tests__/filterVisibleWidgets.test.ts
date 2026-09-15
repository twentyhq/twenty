import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { filterVisibleWidgets } from '@/page-layout/utils/filterVisibleWidgets';
import {
  FieldDisplayMode,
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('filterVisibleWidgets', () => {
  const createMockWidget = (
    id: string,
    conditionalDisplay?: any,
  ): PageLayoutTab['widgets'][0] => ({
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutWidget',
    id,
    applicationId: '',
    isActive: true,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${id}`,
    type: WidgetType.FIELDS,
    objectMetadataId: null,
    position: {
      layoutMode: PageLayoutTabLayoutMode.GRID,
      __typename: 'PageLayoutWidgetGridPosition',
      row: 0,
      column: 0,
      rowSpan: 1,
      columnSpan: 1,
    },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
      viewId: null,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    deletedAt: null,
    conditionalDisplay,
  });

  it('should return all widgets when no conditionalDisplay is set', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2'),
      createMockWidget('widget-3'),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP', selectedRecords: [] },
    });

    expect(result).toHaveLength(3);
    expect(result).toEqual(widgets);
  });

  it('should filter out widgets that should be hidden on MOBILE', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'MOBILE', selectedRecords: [] },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-2']);
  });

  it('should filter out widgets that should be hidden on DESKTOP', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
      createMockWidget('widget-3', {
        and: [{ '===': [{ var: 'device' }, 'DESKTOP'] }],
      }),
    ];

    const result = filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP', selectedRecords: [] },
    });

    expect(result).toHaveLength(2);
    expect(result.map((w) => w.id)).toEqual(['widget-1', 'widget-3']);
  });

  it('should handle empty widgets array', () => {
    const result = filterVisibleWidgets({
      widgets: [],
      context: { device: 'DESKTOP', selectedRecords: [] },
    });

    expect(result).toHaveLength(0);
    expect(result).toEqual([]);
  });

  it('should not mutate the original widgets array', () => {
    const widgets = [
      createMockWidget('widget-1'),
      createMockWidget('widget-2', {
        and: [{ '===': [{ var: 'device' }, 'MOBILE'] }],
      }),
    ];
    const originalLength = widgets.length;

    filterVisibleWidgets({
      widgets,
      context: { device: 'DESKTOP', selectedRecords: [] },
    });

    expect(widgets).toHaveLength(originalLength);
  });

  describe('hiddenFieldMetadataIdsOrNames', () => {
    const createMockFieldWidget = (
      id: string,
      fieldMetadataId: string,
    ): PageLayoutTab['widgets'][0] => ({
      ...createMockWidget(id),
      type: WidgetType.FIELD,
      configuration: {
        __typename: 'FieldConfiguration',
        configurationType: WidgetConfigurationType.FIELD,
        fieldMetadataId,
        fieldDisplayMode: FieldDisplayMode.CARD,
      },
    });

    it('should filter out a field widget referencing a hidden field by id', () => {
      const result = filterVisibleWidgets({
        widgets: [
          createMockFieldWidget('widget-1', 'field-id-1'),
          createMockFieldWidget('widget-2', 'field-id-2'),
        ],
        context: {
          device: 'DESKTOP',
          selectedRecords: [],
          hiddenFieldMetadataIdsOrNames: ['field-id-1'],
        },
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('widget-2');
    });

    it('should filter out a field widget referencing a hidden field by name', () => {
      const result = filterVisibleWidgets({
        widgets: [createMockFieldWidget('widget-1', 'workflow')],
        context: {
          device: 'DESKTOP',
          selectedRecords: [],
          hiddenFieldMetadataIdsOrNames: ['field-id-1', 'workflow'],
        },
      });

      expect(result).toHaveLength(0);
    });

    it('should keep non-field widgets referencing a hidden name', () => {
      const result = filterVisibleWidgets({
        widgets: [createMockWidget('widget-1')],
        context: {
          device: 'DESKTOP',
          selectedRecords: [],
          hiddenFieldMetadataIdsOrNames: ['workflow'],
        },
      });

      expect(result).toHaveLength(1);
    });

    it('should keep every field widget when nothing is hidden', () => {
      const result = filterVisibleWidgets({
        widgets: [
          createMockFieldWidget('widget-1', 'field-id-1'),
          createMockFieldWidget('widget-2', 'field-id-2'),
        ],
        context: { device: 'DESKTOP', selectedRecords: [] },
      });

      expect(result).toHaveLength(2);
    });
  });
});
