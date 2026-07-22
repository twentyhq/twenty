import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { usePublishWidgetHeaderInfo } from '@/page-layout/widgets/hooks/usePublishWidgetHeaderInfo';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderInfoComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderInfoComponentFamilyState';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { IconPlus } from 'twenty-ui/icon';

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
  it('publishes count and primary action to the widget header info state', () => {
    const store = createStore();
    const onClick = jest.fn();

    renderHook(
      () =>
        usePublishWidgetHeaderInfo({
          count: 12,
          primaryAction: { Icon: IconPlus, label: 'Compose', onClick },
        }),
      { wrapper: getWrapper(store) },
    );

    const publishedHeaderInfo = getPublishedHeaderInfo(store);

    expect(publishedHeaderInfo?.count).toBe(12);
    expect(publishedHeaderInfo?.primaryAction?.label).toBe('Compose');
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
});
