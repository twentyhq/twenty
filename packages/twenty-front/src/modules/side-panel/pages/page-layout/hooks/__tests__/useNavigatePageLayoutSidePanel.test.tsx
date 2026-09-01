import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { act, renderHook } from '@testing-library/react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';

jest.mock('@/side-panel/hooks/useNavigateSidePanel');
jest.mock(
  '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore',
);

const mockNavigateSidePanel = jest.fn();

describe('useNavigatePageLayoutSidePanel', () => {
  it('captures the current page layout context in the navigation entry', () => {
    const pageLayoutContext = {
      pageLayoutId: 'dashboard-page-layout-id',
      recordId: 'dashboard-id',
      objectMetadataItemId: 'dashboard-object-metadata-id',
      objectNameSingular: 'dashboard',
    };

    (
      useNavigateSidePanel as jest.MockedFunction<typeof useNavigateSidePanel>
    ).mockReturnValue({ navigateSidePanel: mockNavigateSidePanel });
    (
      usePageLayoutIdFromContextStore as jest.MockedFunction<
        typeof usePageLayoutIdFromContextStore
      >
    ).mockReturnValue(pageLayoutContext);

    const { result } = renderHook(() => useNavigatePageLayoutSidePanel());

    act(() => {
      result.current.navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.DashboardRecordTableSettings,
        pageTitle: 'Companies',
        pageIcon: IconTable,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.DashboardRecordTableSettings,
      pageTitle: 'Companies',
      pageIcon: IconTable,
      focusTitleInput: false,
      resetNavigationStack: false,
      pageLayoutContext,
    });
  });
});
