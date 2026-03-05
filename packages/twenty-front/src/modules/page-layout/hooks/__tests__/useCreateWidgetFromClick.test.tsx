import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useCreateWidgetFromClick } from '@/page-layout/hooks/useCreateWidgetFromClick';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

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

  it('should set dragged area and navigate to widget selection when called with a cellId', () => {
    const { result } = renderHook(
      () => ({
        createWidget: useCreateWidgetFromClick(),
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
          <PageLayoutTestWrapper>{children}</PageLayoutTestWrapper>
        ),
      },
    );

    act(() => {
      result.current.createWidget.createWidgetFromClick('cell-2-3');
    });

    expect(result.current.draggedArea).toEqual({ x: 2, y: 3, w: 1, h: 1 });
    expect(result.current.editingWidgetId).toBeNull();
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutWidgetTypeSelect,
      resetNavigationStack: true,
    });
  });
});
