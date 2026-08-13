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
  it('publishes count and actions to the widget header info state', () => {
    const store = createStore();
    const onClick = jest.fn();

    renderHook(
      () =>
        usePublishWidgetHeaderInfo({
          count: 12,
          actions: [
            { Icon: IconPlus, label: 'Compose', onClick },
            { Icon: IconArrowUpRight, label: 'See all', to: '/objects/tasks' },
          ],
        }),
      { wrapper: getWrapper(store) },
    );

    const publishedHeaderInfo = getPublishedHeaderInfo(store);

    expect(publishedHeaderInfo?.count).toBe(12);
    expect(publishedHeaderInfo?.actions?.map(({ label }) => label)).toEqual([
      'Compose',
      'See all',
    ]);
    expect(publishedHeaderInfo?.actions?.[1]?.to).toBe('/objects/tasks');
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

  it('does not republish equivalent actions', () => {
    const store = createStore();
    const onClick = jest.fn();

    const { rerender } = renderHook(
      () =>
        usePublishWidgetHeaderInfo({
          count: 5,
          actions: [
            {
              Icon: IconPlus,
              label: 'New task',
              onClick,
            },
          ],
        }),
      { wrapper: getWrapper(store) },
    );

    const firstPublished = getPublishedHeaderInfo(store);
    rerender();
    rerender();
    const secondPublished = getPublishedHeaderInfo(store);

    expect(secondPublished).toBe(firstPublished);
  });

  it('publishes the latest onClick', () => {
    const store = createStore();
    const firstOnClick = jest.fn();
    const secondOnClick = jest.fn();

    const { rerender } = renderHook(
      ({ onClick }: { onClick: () => void }) =>
        usePublishWidgetHeaderInfo({
          actions: [{ Icon: IconPlus, label: 'Compose', onClick }],
        }),
      { wrapper: getWrapper(store), initialProps: { onClick: firstOnClick } },
    );

    rerender({ onClick: secondOnClick });

    expect(getPublishedHeaderInfo(store)?.actions?.[0]?.onClick).toBe(
      secondOnClick,
    );

    getPublishedHeaderInfo(store)?.actions?.[0]?.onClick?.();

    expect(firstOnClick).not.toHaveBeenCalled();
    expect(secondOnClick).toHaveBeenCalledTimes(1);
  });

  it('does not rerender the publisher when the header stays non-empty', () => {
    const store = createStore();
    let publisherRenderCount = 0;
    let latestOnClick = () => undefined;

    const { result } = renderHook(
      () => {
        publisherRenderCount++;
        latestOnClick = () => undefined;

        const hasWidgetHeaderInfo = useAtomComponentFamilySelectorValue(
          widgetHasHeaderInfoComponentFamilySelector,
          WIDGET_ID,
        );

        usePublishWidgetHeaderInfo({
          actions: [
            { Icon: IconPlus, label: 'Compose', onClick: latestOnClick },
          ],
        });

        return hasWidgetHeaderInfo;
      },
      { wrapper: getWrapper(store) },
    );

    expect(result.current).toBe(true);
    expect(publisherRenderCount).toBe(2);
    expect(getPublishedHeaderInfo(store)?.actions?.[0]?.onClick).toBe(
      latestOnClick,
    );
  });
});
