import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { usePublishWidgetHeaderInfo } from '@/page-layout/widgets/hooks/usePublishWidgetHeaderInfo';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHasHeaderInfoComponentFamilySelector } from '@/page-layout/widgets/states/selectors/widgetHasHeaderInfoComponentFamilySelector';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { IconArrowUpRight, IconPlus } from 'twenty-ui/icon';

const WIDGET_ID = 'widget-under-test';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <PageLayoutTestWrapper
      store={store}
      instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
    >
      <WidgetComponentInstanceContext.Provider
        value={{ instanceId: WIDGET_ID }}
      >
        {children}
      </WidgetComponentInstanceContext.Provider>
    </PageLayoutTestWrapper>
  );

const getPublishedHeaderInfo = (store: ReturnType<typeof createStore>) =>
  store.get(
    widgetHeaderInfoComponentFamilyState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      familyKey: WIDGET_ID,
    }),
  );

describe('usePublishWidgetHeaderInfo', () => {
  it('publishes count and multiple actions to the widget header', () => {
    const store = createStore();

    renderHook(
      () =>
        usePublishWidgetHeaderInfo({
          count: 12,
          actions: [
            {
              id: 'compose',
              Icon: IconPlus,
              label: 'Compose',
              onClick: jest.fn(),
            },
            {
              id: 'see-all',
              Icon: IconArrowUpRight,
              label: 'See all',
              to: '/objects/tasks',
            },
          ],
        }),
      { wrapper: getWrapper(store) },
    );

    const publishedHeaderInfo = getPublishedHeaderInfo(store);

    expect(publishedHeaderInfo?.count).toBe(12);
    expect(publishedHeaderInfo?.actions?.map(({ id }) => id)).toEqual([
      'compose',
      'see-all',
    ]);
    expect(publishedHeaderInfo?.actions?.[1].to).toBe('/objects/tasks');
  });

  it('clears the published header info on unmount', () => {
    const store = createStore();

    const { unmount } = renderHook(
      () => usePublishWidgetHeaderInfo({ count: 3 }),
      { wrapper: getWrapper(store) },
    );

    expect(getPublishedHeaderInfo(store)?.count).toBe(3);

    unmount();

    expect(getPublishedHeaderInfo(store)).toBeNull();
  });

  it('no-ops without throwing when rendered outside a widget', () => {
    expect(() =>
      renderHook(() => usePublishWidgetHeaderInfo({ count: 7 })),
    ).not.toThrow();
  });

  it('keeps the published state stable across inline action rerenders', () => {
    const store = createStore();

    const { rerender } = renderHook(
      () =>
        usePublishWidgetHeaderInfo({
          count: 5,
          actions: [
            {
              id: 'new-task',
              Icon: IconPlus,
              label: 'New task',
              onClick: () => undefined,
            },
          ],
        }),
      { wrapper: getWrapper(store) },
    );

    const firstPublishedHeaderInfo = getPublishedHeaderInfo(store);

    rerender();
    rerender();

    expect(getPublishedHeaderInfo(store)).toBe(firstPublishedHeaderInfo);
  });

  it('calls the latest action callback through the stable published action', () => {
    const store = createStore();
    const firstOnClick = jest.fn();
    const secondOnClick = jest.fn();

    const { rerender } = renderHook(
      ({ onClick }: { onClick: () => void }) =>
        usePublishWidgetHeaderInfo({
          actions: [
            {
              id: 'compose',
              Icon: IconPlus,
              label: 'Compose',
              onClick,
            },
          ],
        }),
      { wrapper: getWrapper(store), initialProps: { onClick: firstOnClick } },
    );

    const firstPublishedHeaderInfo = getPublishedHeaderInfo(store);

    rerender({ onClick: secondOnClick });

    const secondPublishedHeaderInfo = getPublishedHeaderInfo(store);

    expect(secondPublishedHeaderInfo).toBe(firstPublishedHeaderInfo);

    secondPublishedHeaderInfo?.actions?.[0].onClick?.();

    expect(firstOnClick).not.toHaveBeenCalled();
    expect(secondOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not rerender the publisher while the header stays non-empty', () => {
    const store = createStore();
    let publisherRenderCount = 0;

    const { result } = renderHook(
      () => {
        publisherRenderCount++;

        const hasWidgetHeaderInfo = useAtomComponentFamilySelectorValue(
          widgetHasHeaderInfoComponentFamilySelector,
          WIDGET_ID,
        );

        usePublishWidgetHeaderInfo({
          actions: [
            {
              id: 'compose',
              Icon: IconPlus,
              label: 'Compose',
              onClick: () => undefined,
            },
          ],
        });

        return hasWidgetHeaderInfo;
      },
      { wrapper: getWrapper(store) },
    );

    expect(result.current).toBe(true);
    expect(publisherRenderCount).toBe(2);
  });
});
