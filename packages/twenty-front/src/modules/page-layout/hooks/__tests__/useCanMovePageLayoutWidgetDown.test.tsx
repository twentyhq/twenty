import { useCanMovePageLayoutWidgetDown } from '@/page-layout/hooks/useCanMovePageLayoutWidgetDown';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { type DraftPageLayout } from '@/page-layout/types/DraftPageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

const makeWidget = (
  id: string,
  index: number,
  tabId: string = 'tab-1',
): PageLayoutWidget =>
  ({
    id,
    pageLayoutTabId: tabId,
    title: id,
    type: WidgetType.FIELDS,
    gridPosition: { column: 0, columnSpan: 1, row: 0, rowSpan: 1 },
    configuration: { __typename: 'FieldsConfiguration' as const },
    position: {
      __typename: 'PageLayoutWidgetVerticalListPosition' as const,
      layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
      index,
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    deletedAt: null,
  }) as unknown as PageLayoutWidget;

const makeTab = (
  id: string,
  widgets: PageLayoutWidget[],
  position: number = 0,
  layoutMode: PageLayoutTabLayoutMode = PageLayoutTabLayoutMode.VERTICAL_LIST,
) => ({
  id,
  applicationId: '',
  title: id,
  position,
  layoutMode,
  pageLayoutId: '',
  widgets,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  deletedAt: null,
});

const makeDraft = (tabs: ReturnType<typeof makeTab>[]): DraftPageLayout => ({
  id: 'test-layout',
  name: 'Test Layout',
  type: PageLayoutType.RECORD_PAGE,
  objectMetadataId: null,
  tabs,
});

describe('useCanMovePageLayoutWidgetDown', () => {
  const getWrapper =
    (store = createStore()) =>
    ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper
        store={store}
        instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
      >
        {children}
      </PageLayoutTestWrapper>
    );

  const getDraftAtom = () =>
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    });

  it('should return true when widget is not the last one', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
    );

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetDown('widget-a')).toBe(true);
  });

  it('should return false when widget is the last one', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
    );

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetDown('widget-b')).toBe(false);
  });

  it('should return false when widget is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);

    store.set(getDraftAtom(), makeDraft([makeTab('tab-1', [widgetA])]));

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetDown('non-existent')).toBe(
      false,
    );
  });

  it('should return false for non-VERTICAL_LIST tab', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([
        makeTab('tab-1', [widgetA, widgetB], 0, PageLayoutTabLayoutMode.CANVAS),
      ]),
    );

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetDown(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetDown('widget-a')).toBe(false);
  });
});
