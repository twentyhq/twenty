import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { WidgetHeaderCountEffect } from '@/page-layout/widgets/components/WidgetHeaderCountEffect';
import { WidgetComponentInstanceContext } from '@/page-layout/widgets/states/contexts/WidgetComponentInstanceContext';
import { widgetHeaderCountComponentFamilyState } from '@/page-layout/widgets/states/widgetHeaderCountComponentFamilyState';
import { render } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';

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

const getStoredWidgetHeaderCount = (store: ReturnType<typeof createStore>) =>
  store.get(
    widgetHeaderCountComponentFamilyState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      familyKey: WIDGET_ID,
    }),
  );

describe('WidgetHeaderCountEffect', () => {
  it('syncs the count to the widget header state', () => {
    const store = createStore();

    render(<WidgetHeaderCountEffect count={12} />, {
      wrapper: getWrapper(store),
    });

    expect(getStoredWidgetHeaderCount(store)).toBe(12);
  });

  it('syncs count updates', () => {
    const store = createStore();

    const { rerender } = render(<WidgetHeaderCountEffect count={12} />, {
      wrapper: getWrapper(store),
    });

    rerender(<WidgetHeaderCountEffect count={13} />);

    expect(getStoredWidgetHeaderCount(store)).toBe(13);
  });

  it('stores null while the count is undefined', () => {
    const store = createStore();

    render(<WidgetHeaderCountEffect />, {
      wrapper: getWrapper(store),
    });

    expect(getStoredWidgetHeaderCount(store)).toBeNull();
  });

  it('clears the widget header state on unmount', () => {
    const store = createStore();

    const { unmount } = render(<WidgetHeaderCountEffect count={3} />, {
      wrapper: getWrapper(store),
    });

    expect(getStoredWidgetHeaderCount(store)).toBe(3);

    unmount();

    expect(getStoredWidgetHeaderCount(store)).toBeNull();
  });

  it('no-ops without throwing when rendered outside a widget', () => {
    expect(() => render(<WidgetHeaderCountEffect count={7} />)).not.toThrow();
  });
});
