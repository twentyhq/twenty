import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { shouldPrerenderPageLayoutTab } from '@/page-layout/utils/shouldPrerenderPageLayoutTab';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('shouldPrerenderPageLayoutTab', () => {
  const createMockWidget = (type: WidgetType): PageLayoutTab['widgets'][0] => ({
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    __typename: 'PageLayoutWidget',
    id: `widget-${type}`,
    applicationId: '',
    isActive: true,
    pageLayoutTabId: 'tab-1',
    title: `Widget ${type}`,
    type,
    objectMetadataId: null,
    position: {
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
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
  });

  const createMockTab = ({
    layoutMode,
    widgetTypes,
  }: {
    layoutMode?: PageLayoutTabLayoutMode;
    widgetTypes: WidgetType[];
  }): PageLayoutTab => ({
    isSystemSideEffect: false,
    universalIdentifier: 'universal-identifier-mock',
    id: 'tab-1',
    applicationId: '',
    isActive: true,
    pageLayoutId: 'page-layout-1',
    title: 'Tab 1',
    position: 0,
    layoutMode,
    widgets: widgetTypes.map(createMockWidget),
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
  });

  it('allows a vertical-list record tab with only prerenderable widgets', () => {
    expect(
      shouldPrerenderPageLayoutTab({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE, WidgetType.EMAILS],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe(true);
  });

  it('rejects non record-page layouts', () => {
    expect(
      shouldPrerenderPageLayoutTab({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE],
        }),
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
    ).toBe(false);
  });

  it('rejects grid tabs', () => {
    expect(
      shouldPrerenderPageLayoutTab({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgetTypes: [WidgetType.TIMELINE],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe(false);
  });

  it('allows tabs holding workspace application widgets', () => {
    expect(
      shouldPrerenderPageLayoutTab({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.FRONT_COMPONENT, WidgetType.IFRAME],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe(true);
  });

  it('rejects tabs containing a non-prerenderable widget', () => {
    expect(
      shouldPrerenderPageLayoutTab({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE, WidgetType.RECORD_TABLE],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe(false);
  });
});
