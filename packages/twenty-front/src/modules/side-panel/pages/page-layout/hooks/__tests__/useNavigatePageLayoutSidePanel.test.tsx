import { renderHook } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';

import { SIDE_PANEL_COMPONENT_INSTANCE_ID } from '@/side-panel/constants/SidePanelComponentInstanceId';
import { PageLayoutSidePanelTargetProvider } from '@/side-panel/pages/page-layout/components/PageLayoutSidePanelTargetProvider';
import { useNavigatePageLayoutSidePanel } from '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel';
import { usePageLayoutSidePanelTarget } from '@/side-panel/pages/page-layout/hooks/usePageLayoutSidePanelTarget';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { getJestMetadataAndApolloMocksAndCommandMenuWrapper } from '~/testing/jest/getJestMetadataAndApolloMocksAndCommandMenuWrapper';

const DASHBOARD_TARGET_RECORD_IDENTIFIER = {
  id: 'dashboard-record-id',
  targetObjectNameSingular: 'dashboard',
};

// The main context store targets another record than the page layout opening
// the side panel, so only the opener can say what the panel edits
const MetadataWrapper = getJestMetadataAndApolloMocksAndCommandMenuWrapper({
  apolloMocks: [],
  componentInstanceId: SIDE_PANEL_COMPONENT_INSTANCE_ID,
  contextStoreCurrentObjectMetadataNameSingular: 'company',
  contextStoreTargetedRecordsRule: {
    mode: 'selection',
    selectedRecordIds: ['company-record-id'],
  },
});

const PageLayoutWrapper = ({ children }: { children: ReactNode }) => (
  <MetadataWrapper>
    <PageLayoutSidePanelTargetProvider
      pageLayoutId="dashboard-page-layout-id"
      targetRecordIdentifier={DASHBOARD_TARGET_RECORD_IDENTIFIER}
    >
      {children}
    </PageLayoutSidePanelTargetProvider>
  </MetadataWrapper>
);

describe('useNavigatePageLayoutSidePanel', () => {
  beforeEach(() => {
    jotaiStore.set(sidePanelNavigationStackState.atom, []);
  });

  it('should store the page layout it is opened from on the navigation item', () => {
    const { result } = renderHook(() => useNavigatePageLayoutSidePanel(), {
      wrapper: PageLayoutWrapper,
    });

    act(() => {
      result.current.navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.DashboardChartSettings,
        resetNavigationStack: true,
      });
    });

    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([
      expect.objectContaining({
        page: SidePanelPages.DashboardChartSettings,
        pageLayoutSidePanelTarget: {
          pageLayoutId: 'dashboard-page-layout-id',
          targetRecordIdentifier: DASHBOARD_TARGET_RECORD_IDENTIFIER,
        },
      }),
    ]);
  });

  it('should refuse to open a page layout page outside of a page layout', () => {
    const { result } = renderHook(() => useNavigatePageLayoutSidePanel(), {
      wrapper: MetadataWrapper,
    });

    expect(() =>
      result.current.navigatePageLayoutSidePanel({
        sidePanelPage: SidePanelPages.DashboardChartSettings,
      }),
    ).toThrow();
    expect(jotaiStore.get(sidePanelNavigationStackState.atom)).toEqual([]);
  });
});

describe('usePageLayoutSidePanelTarget', () => {
  it('should read the page layout target provided around it', () => {
    const { result } = renderHook(() => usePageLayoutSidePanelTarget(), {
      wrapper: PageLayoutWrapper,
    });

    expect(result.current).toEqual({
      pageLayoutId: 'dashboard-page-layout-id',
      targetRecordIdentifier: DASHBOARD_TARGET_RECORD_IDENTIFIER,
    });
  });
});
