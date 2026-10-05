import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { widgetInsertionContextComponentState } from '@/page-layout/states/widgetInsertionContextComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { useOpenReplaceWidgetPicker } from '@/side-panel/pages/page-layout/hooks/useOpenReplaceWidgetPicker';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
);

describe('useOpenReplaceWidgetPicker', () => {
  it('clears an insertion context before opening the replacement picker', () => {
    const store = createStore();
    const widget = makeWidget('widget', 0);
    const mockNavigatePageLayoutSidePanel = jest.fn();
    const insertionContextAtom =
      widgetInsertionContextComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      });

    (
      useNavigatePageLayoutSidePanel as jest.MockedFunction<
        typeof useNavigatePageLayoutSidePanel
      >
    ).mockReturnValue({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    });

    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
      makeDraft([makeTab('tab-1', [widget])]),
    );
    store.set(insertionContextAtom, {
      targetWidgetId: widget.id,
      direction: 'below',
    });

    const { result } = renderHook(
      () => useOpenReplaceWidgetPicker(PAGE_LAYOUT_TEST_INSTANCE_ID),
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <PageLayoutTestWrapper store={store}>
            {children}
          </PageLayoutTestWrapper>
        ),
      },
    );

    act(() => result.current.openReplaceWidgetPicker());

    expect(store.get(insertionContextAtom)).toBeNull();
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
    });
  });
});
