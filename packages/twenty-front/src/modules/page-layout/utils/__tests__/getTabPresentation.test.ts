import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { getTabPresentation } from '@/page-layout/utils/getTabPresentation';
import {
  PageLayoutTabLayoutMode,
  WidgetType,
} from '~/generated-metadata/graphql';

const widgetOfType = (type: WidgetType) => ({ type }) as PageLayoutWidget;

describe('getTabPresentation', () => {
  it('returns solo for any single widget on a list tab', () => {
    expect(
      getTabPresentation({
        widgets: [widgetOfType(WidgetType.TASKS)],
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      }),
    ).toBe('solo');

    expect(
      getTabPresentation({
        widgets: [widgetOfType(WidgetType.FIELDS)],
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      }),
    ).toBe('solo');
  });

  it('treats a legacy CANVAS tab with a single widget as solo', () => {
    expect(
      getTabPresentation({
        widgets: [widgetOfType(WidgetType.CALENDAR)],
        layoutMode: PageLayoutTabLayoutMode.CANVAS,
      }),
    ).toBe('solo');
  });

  it('returns stack when more than one widget is present', () => {
    expect(
      getTabPresentation({
        widgets: [
          widgetOfType(WidgetType.TASKS),
          widgetOfType(WidgetType.GRAPH),
        ],
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      }),
    ).toBe('stack');
  });

  it('returns stack for an empty tab', () => {
    expect(
      getTabPresentation({
        widgets: [],
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      }),
    ).toBe('stack');
  });

  it('always returns stack in edit mode', () => {
    expect(
      getTabPresentation({
        widgets: [widgetOfType(WidgetType.TASKS)],
        layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
        isInEditMode: true,
      }),
    ).toBe('stack');
  });

  it('never returns solo for grid (dashboard) tabs', () => {
    expect(
      getTabPresentation({
        widgets: [widgetOfType(WidgetType.RECORD_TABLE)],
        layoutMode: PageLayoutTabLayoutMode.GRID,
      }),
    ).toBe('stack');
  });
});
