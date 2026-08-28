import { type PageLayoutTab } from '@/page-layout/types/PageLayoutTab';
import { getPageLayoutTabPrerenderMode } from '@/page-layout/utils/getPageLayoutTabPrerenderMode';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';

describe('getPageLayoutTabPrerenderMode', () => {
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

  it('prerenders suspense-only vertical-list record tabs inside a hidden Activity', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE, WidgetType.EMAILS],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('hidden-activity');
  });

  it('mounts application widget tabs offscreen so they fully boot while hidden', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.FRONT_COMPONENT],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('offscreen-mounted');

    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.IFRAME],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('offscreen-mounted');
  });

  it('mounts tabs mixing data cards and application widgets offscreen as a whole', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE, WidgetType.FRONT_COMPONENT],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('offscreen-mounted');
  });

  it('rejects non record-page layouts', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE],
        }),
        pageLayoutType: PageLayoutType.DASHBOARD,
      }),
    ).toBe('not-prerenderable');
  });

  it('rejects grid tabs', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.GRID,
          widgetTypes: [WidgetType.TIMELINE],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('not-prerenderable');
  });

  it('rejects tabs containing widgets outside both prerenderable sets', () => {
    expect(
      getPageLayoutTabPrerenderMode({
        tab: createMockTab({
          layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
          widgetTypes: [WidgetType.TIMELINE, WidgetType.RECORD_TABLE],
        }),
        pageLayoutType: PageLayoutType.RECORD_PAGE,
      }),
    ).toBe('not-prerenderable');
  });
});
