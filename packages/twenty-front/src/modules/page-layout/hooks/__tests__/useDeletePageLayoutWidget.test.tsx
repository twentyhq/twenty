import { useDeletePageLayoutWidget } from '@/page-layout/hooks/useDeletePageLayoutWidget';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock(
  '@/page-layout/widgets/record-table/hooks/useRemoveDraftViewForRecordTableWidget',
  () => ({
    useRemoveDraftViewForRecordTableWidget: () => ({
      removeDraftViewForRecordTableWidget: jest.fn(),
    }),
  }),
);

jest.mock(
  '@/page-layout/widgets/fields/hooks/useDeleteViewForFieldsWidget',
  () => ({
    useDeleteViewForFieldsWidget: () => ({
      deleteViewForFieldsWidget: jest.fn(),
    }),
  }),
);

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    closeSidePanelMenu: jest.fn(),
    openSidePanelMenu: jest.fn(),
    navigateSidePanelMenu: jest.fn(),
    toggleSidePanelMenu: jest.fn(),
  }),
}));

describe('useDeletePageLayoutWidget', () => {
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

  it('should clear editing widget id when deleting the edited widget', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      'widget-1',
    );

    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('widget-1');
    });

    expect(
      store.get(
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBeNull();
  });

  it('should keep editing widget id when deleting a different widget', () => {
    const store = createStore();
    const wrapper = getWrapper(store);

    store.set(
      pageLayoutEditingWidgetIdComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      'edited-widget-id',
    );

    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('another-widget-id');
    });

    expect(
      store.get(
        pageLayoutEditingWidgetIdComponentState.atomFamily({
          instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        }),
      ),
    ).toBe('edited-widget-id');
  });

  it('should handle empty layouts', () => {
    const { result } = renderHook(
      () => useDeletePageLayoutWidget(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: PageLayoutTestWrapper,
      },
    );

    act(() => {
      result.current.deletePageLayoutWidget('any-widget');
    });

    expect(typeof result.current.deletePageLayoutWidget).toBe('function');
  });
});
