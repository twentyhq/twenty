import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { currentPageLayoutIdState } from '@/page-layout/states/currentPageLayoutIdState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconTable } from 'twenty-ui/icon';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

jest.mock('@/side-panel/hooks/useNavigateSidePanel');

const DASHBOARD_ID = 'dashboard-id';
const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout-id';
const dashboardObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('dashboard');

const mockNavigateSidePanel = jest.fn();

describe('useNavigatePageLayoutSidePanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (
      useNavigateSidePanel as jest.MockedFunction<typeof useNavigateSidePanel>
    ).mockReturnValue({ navigateSidePanel: mockNavigateSidePanel });
  });

  it('captures the current page layout context in the navigation entry', () => {
    const wrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
      apolloMocks: [],
      componentInstanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      contextStoreCurrentObjectMetadataNameSingular: 'dashboard',
      contextStoreTargetedRecordsRule: {
        mode: 'selection',
        selectedRecordIds: [DASHBOARD_ID],
      },
      contextStoreNumberOfSelectedRecords: 1,
      onInitializeJotaiStore: (store) => {
        store.set(currentPageLayoutIdState.atom, DASHBOARD_PAGE_LAYOUT_ID);
      },
    });

    const { result } = renderHook(() => useNavigatePageLayoutSidePanel(), {
      wrapper,
    });

    act(() => {
      result.current.navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.DashboardRecordTableSettings,
        pageTitle: 'Companies',
        pageIcon: IconTable,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    expect(mockNavigateSidePanel).toHaveBeenCalledWith({
      page: SidePanelPages.DashboardRecordTableSettings,
      pageTitle: 'Companies',
      pageIcon: IconTable,
      focusTitleInput: false,
      resetNavigationStack: false,
      pageLayoutContext: {
        pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
        recordId: DASHBOARD_ID,
        objectMetadataItemId: dashboardObjectMetadataItem.id,
        objectNameSingular: 'dashboard',
      },
    });
  });

  it('navigates without context when no record is selected', () => {
    const store = createStore();

    const { result } = renderHook(() => useNavigatePageLayoutSidePanel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={store}>{children}</JotaiProvider>
      ),
    });

    act(() => {
      result.current.navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.PageLayoutTabSettings,
      });
    });

    expect(mockNavigateSidePanel).toHaveBeenCalledTimes(1);
    expect(mockNavigateSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        page: SidePanelPages.PageLayoutTabSettings,
        pageTitle: 'Tab Settings',
        focusTitleInput: false,
        resetNavigationStack: false,
      }),
    );
    expect(mockNavigateSidePanel.mock.calls[0][0]).not.toHaveProperty(
      'pageLayoutContext',
    );
  });
});
