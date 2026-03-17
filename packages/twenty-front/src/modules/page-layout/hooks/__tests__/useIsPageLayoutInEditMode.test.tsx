import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
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

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
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

  it('should infer record page layout type from persisted layout when layoutType is omitted', () => {
    const store = createStore();

    const wrapper = ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper
        store={store}
        instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
      >
        {children}
      </PageLayoutTestWrapper>
    );

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
    store.set(
      isDashboardInEditModeComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      false,
    );
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      {
        __typename: 'PageLayout',
        id: PAGE_LAYOUT_TEST_INSTANCE_ID,
        name: 'Record Page',
        type: PageLayoutType.RECORD_PAGE,
        objectMetadataId: 'company-id',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        deletedAt: null,
        tabs: [],
        defaultTabToFocusOnMobileAndSidePanelId: null,
      },
    );

    const { result } = renderHook(() => useIsPageLayoutInEditMode(), {
      wrapper,
    });

    expect(result.current).toBe(true);
  });

  it('should use dashboard edit mode state for dashboard pages', () => {
    const store = createStore();
    const wrapper = getWrapper(store, PageLayoutType.DASHBOARD);

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
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
