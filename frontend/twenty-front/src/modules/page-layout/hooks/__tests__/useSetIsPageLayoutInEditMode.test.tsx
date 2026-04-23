import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useSetIsPageLayoutInEditMode } from '@/page-layout/hooks/useSetIsPageLayoutInEditMode';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { PageLayoutType } from '~/generated-metadata/graphql';

const MOCK_DASHBOARD_LAYOUT: PageLayout = {
  __typename: 'PageLayout',
  id: PAGE_LAYOUT_TEST_INSTANCE_ID,
  name: 'Dashboard Layout',
  type: PageLayoutType.DASHBOARD,
  objectMetadataId: 'object-metadata-id',
  tabs: [],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
  deletedAt: null,
  defaultTabToFocusOnMobileAndSidePanelId: null,
};

const getWrapper =
  (store = createStore()) =>
  ({ children }: { children: ReactNode }) => (
    <PageLayoutTestWrapper
      store={store}
      layoutType={PageLayoutType.DASHBOARD}
      instanceId={PAGE_LAYOUT_TEST_INSTANCE_ID}
    >
      {children}
    </PageLayoutTestWrapper>
  );

describe('useSetIsPageLayoutInEditMode', () => {
  it('should block dashboard edit mode while global layout customization is active', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(isLayoutCustomizationModeEnabledState.atom, true);
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      MOCK_DASHBOARD_LAYOUT,
    );

    const { result } = renderHook(
      () => useSetIsPageLayoutInEditMode(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.setIsPageLayoutInEditMode(true);
    });

    expect(
      store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBe(false);
  });

  it('should allow dashboard edit mode when global layout customization is inactive', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(isLayoutCustomizationModeEnabledState.atom, false);
    store.set(
      pageLayoutPersistedComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      MOCK_DASHBOARD_LAYOUT,
    );

    const { result } = renderHook(
      () => useSetIsPageLayoutInEditMode(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.setIsPageLayoutInEditMode(true);
    });

    expect(
      store.get(
        isDashboardInEditModeComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBe(true);
  });
});
