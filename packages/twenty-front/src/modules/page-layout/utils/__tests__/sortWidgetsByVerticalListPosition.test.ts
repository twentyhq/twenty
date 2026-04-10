import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { sortWidgetsByVerticalListPosition } from '@/page-layout/utils/sortWidgetsByVerticalListPosition';
import {
  PageLayoutTabLayoutMode,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

const makeWidget = (id: string, index: number): PageLayoutWidget =>
  ({
    __typename: 'PageLayoutWidget',
    id,
    pageLayoutTabId: 'tab-1',
    title: id,
    type: WidgetType.FIELDS,
    gridPosition: { row: 0, column: 0, rowSpan: 1, columnSpan: 1 },
    configuration: {
      __typename: 'FieldsConfiguration',
      configurationType: WidgetConfigurationType.FIELDS,
    },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition',
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
    objectMetadataId: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    deletedAt: null,
  }) as unknown as PageLayoutWidget;

describe('sortWidgetsByVerticalListPosition', () => {
  it('should sort widgets by index ascending', () => {
    const widgets = [
      makeWidget('c', 2),
      makeWidget('a', 0),
      makeWidget('b', 1),
    ];

    const sorted = sortWidgetsByVerticalListPosition(widgets);

    expect(sorted.map((w) => w.id)).toEqual(['a', 'b', 'c']);
  });

  it('should not mutate the original array', () => {
    const widgets = [makeWidget('b', 1), makeWidget('a', 0)];
    const original = [...widgets];

    sortWidgetsByVerticalListPosition(widgets);

    expect(widgets.map((w) => w.id)).toEqual(original.map((w) => w.id));
  });

  it('should handle widgets with undefined positions by treating as index 0', () => {
    const widgetWithPosition = makeWidget('b', 1);
    const widgetWithoutPosition = {
      ...makeWidget('a', 0),
      position: undefined,
    } as unknown as PageLayoutWidget;

    const sorted = sortWidgetsByVerticalListPosition([
      widgetWithPosition,
      widgetWithoutPosition,
    ]);

    expect(sorted.map((w) => w.id)).toEqual(['a', 'b']);
  });

  it('should return empty array when given empty array', () => {
    expect(sortWidgetsByVerticalListPosition([])).toEqual([]);
  });

  it('should handle single widget', () => {
    const widgets = [makeWidget('a', 0)];

    const sorted = sortWidgetsByVerticalListPosition(widgets);

    expect(sorted.map((w) => w.id)).toEqual(['a']);
  });
});
