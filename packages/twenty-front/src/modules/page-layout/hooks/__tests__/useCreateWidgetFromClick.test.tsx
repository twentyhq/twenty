import { useNavigatePageLayoutCommandMenu } from '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { act, renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { pageLayoutDraggedAreaComponentState } from '@/page-layout/states/pageLayoutDraggedAreaComponentState';
import { pageLayoutEditingWidgetIdComponentState } from '@/page-layout/states/pageLayoutEditingWidgetIdComponentState';
import { useCreateWidgetFromClick } from '@/page-layout/hooks/useCreateWidgetFromClick';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

jest.mock(
  '@/command-menu/pages/page-layout/hooks/useNavigatePageLayoutCommandMenu',
);

describe('useCreateWidgetFromClick', () => {
  const mockNavigatePageLayoutCommandMenu = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useNavigatePageLayoutCommandMenu as jest.Mock).mockReturnValue({
      navigatePageLayoutCommandMenu: mockNavigatePageLayoutCommandMenu,
    });
  });

  it('should set dragged area and navigate to widget selection when called with a cellId', () => {
    const { result } = renderHook(
      () => ({
        createWidget: useCreateWidgetFromClick(),
        draggedArea: useRecoilComponentValue(
          pageLayoutDraggedAreaComponentState,
          PAGE_LAYOUT_TEST_INSTANCE_ID,
        ),
        editingWidgetId: useRecoilComponentValue(
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
    expect(mockNavigatePageLayoutCommandMenu).toHaveBeenCalledWith({
      commandMenuPage: CommandMenuPages.PageLayoutWidgetTypeSelect,
      resetNavigationStack: true,
    });
  });
});
