import { useCreateWidgetFromClick } from '@/page-layout/hooks/useCreateWidgetFromClick';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
);

describe('useCreateWidgetFromClick', () => {
  const mockNavigatePageLayoutSidePanel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigatePageLayoutSidePanel as jest.Mock).mockReturnValue({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    });
  });

  it.each([false, true])(
    'keeps the clicked area when interrupting a closing panel: %s',
    (isPanelClosing) => {
      const store = createStore();
      const draggedAreaAtom = pageLayoutDraggedAreaComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
        surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      });
      if (isPanelClosing) {
        mockNavigatePageLayoutSidePanel.mockImplementationOnce(() => {
          store.set(draggedAreaAtom, null);
        });
      }
      const { result } = renderHook(
        () => ({
          createWidget: useCreateWidgetFromClick(PAGE_LAYOUT_TEST_INSTANCE_ID),
          draggedArea: useAtomComponentStateValue(
            pageLayoutDraggedAreaComponentState,
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
          editingWidgetId: useAtomComponentStateValue(
            pageLayoutEditingWidgetIdComponentState,
            PAGE_LAYOUT_TEST_INSTANCE_ID,
          ),
        }),
        {
          wrapper: ({ children }: { children: ReactNode }) => (
            <PageLayoutTestWrapper store={store}>
              {children}
            </PageLayoutTestWrapper>
          ),
        },
      );

      act(() => {
        result.current.createWidget.createWidgetFromClick('cell-2-3');
      });

      expect(result.current.draggedArea).toEqual({ x: 2, y: 3, w: 1, h: 1 });
      expect(result.current.editingWidgetId).toBeNull();
      expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
        sidePanelPage: SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
        resetNavigationStack: true,
      });
    },
  );
});
