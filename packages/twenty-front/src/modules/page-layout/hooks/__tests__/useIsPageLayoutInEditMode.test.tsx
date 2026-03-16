import { isLayoutCustomizationActiveState } from '@/app/states/isLayoutCustomizationActiveState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

const getWrapper =
  (
    store = createStore(),
    layoutType: PageLayoutType = PageLayoutType.DASHBOARD,
  ) =>
  ({ children }: { children: ReactNode }) => (
    <PageLayoutTestWrapper
      store={store}
      layoutType={layoutType}
      instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
    >
      {children}
    </PageLayoutTestWrapper>
  );

describe('useIsPageLayoutInEditMode', () => {
  it('should use global layout customization state for record pages', () => {
    const store = createStore();
    const wrapper = getWrapper(store, PageLayoutType.RECORD_PAGE);

    store.set(isLayoutCustomizationActiveState.atom, true);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      false,
    );

    const { result } = renderHook(() => useIsPageLayoutInEditMode(), {
      wrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should use dashboard edit mode state for dashboard pages', () => {
    const store = createStore();
    const wrapper = getWrapper(store, PageLayoutType.DASHBOARD);

    store.set(isLayoutCustomizationActiveState.atom, true);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      false,
    );

    const { result } = renderHook(() => useIsPageLayoutInEditMode(), {
      wrapper,
    });

    expect(result.current).toBe(false);
  });
});
