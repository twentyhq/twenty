import { useCanMovePageLayoutWidgetUp } from '@/page-layout/hooks/useCanMovePageLayoutWidgetUp';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutTabLayoutMode } from '~/generated-metadata/graphql';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

describe('useCanMovePageLayoutWidgetUp', () => {
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

  it('should return true when widget is not the first one', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
    );

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetUp('widget-b')).toBe(true);
  });

  it('should return false when widget is the first one', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);
    const widgetB = makeWidget('widget-b', 1);

    store.set(
      getDraftAtom(),
      makeDraft([makeTab('tab-1', [widgetA, widgetB])]),
    );

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetUp('widget-a')).toBe(false);
  });

  it('should return false when widget is not found', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    const widgetA = makeWidget('widget-a', 0);

    store.set(getDraftAtom(), makeDraft([makeTab('tab-1', [widgetA])]));

    const { result } = renderHook(
      () => useCanMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetUp('non-existent')).toBe(
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
      () => useCanMovePageLayoutWidgetUp(PAGE_LAYOUT_TEST_INSTANCE_ID),
      { wrapper },
    );

    expect(result.current.canMovePageLayoutWidgetUp('widget-b')).toBe(false);
  });
});
