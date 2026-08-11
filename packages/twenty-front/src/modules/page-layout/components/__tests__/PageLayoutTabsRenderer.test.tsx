import { PageLayoutTabsRenderer } from '@/page-layout/components/PageLayoutTabsRenderer';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
} from '~/generated-metadata/graphql';

let mockActiveTabId = 'hidden-transcript-tab-id';
const mockSetActiveTabId = jest.fn();

const homeTab = {
  __typename: 'PageLayoutTab' as const,
  id: 'home-tab-id',
  title: 'Home',
  position: 0,
  icon: 'IconHome',
  layoutMode: PageLayoutTabLayoutMode.GRID,
  widgets: [],
  pageLayoutId: 'page-layout-id',
  createdAt: '2026-08-07T00:00:00.000Z',
  updatedAt: '2026-08-07T00:00:00.000Z',
  deletedAt: null,
};

jest.mock('@/page-layout/components/dnd/PageLayoutWidgetDndProvider', () => ({
  PageLayoutWidgetDndProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutTabList', () => ({
  PageLayoutTabList: () => null,
}));

jest.mock('@/page-layout/hooks/useCurrentPageLayoutOrThrow', () => ({
  useCurrentPageLayoutOrThrow: () => ({
    currentPageLayout: {
      id: 'page-layout-id',
      type: PageLayoutType.RECORD_PAGE,
      tabs: [homeTab],
      defaultTabToFocusOnMobileAndSidePanelId: null,
    },
  }),
}));

jest.mock('@/page-layout/hooks/useIsPageLayoutInEditMode', () => ({
  useIsPageLayoutInEditMode: () => false,
}));

jest.mock('@/page-layout/hooks/usePageLayoutAddTabStrategy', () => ({
  usePageLayoutAddTabStrategy: () => ({ type: 'insert' }),
}));

jest.mock('@/page-layout/hooks/usePageLayoutRenderableTabs', () => ({
  usePageLayoutRenderableTabs: () => ({
    tabsToRenderInTabList: [homeTab],
    pinnedLeftTab: undefined,
  }),
}));

jest.mock('@/page-layout/PageLayoutMainContent', () => ({
  PageLayoutMainContent: ({ tabId }: { tabId: string }) => (
    <div>Rendered tab: {tabId}</div>
  ),
}));

jest.mock('@/ui/layout/contexts/LayoutRenderingContext', () => ({
  useLayoutRenderingContext: () => ({
    isInSidePanel: false,
    layoutType: 'record-page',
    targetRecordIdentifier: {
      id: 'calendar-event-id',
      targetObjectNameSingular: 'calendarEvent',
    },
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: () => mockActiveTabId,
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => [mockActiveTabId, mockSetActiveTabId],
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

describe('PageLayoutTabsRenderer', () => {
  beforeEach(() => {
    mockSetActiveTabId.mockClear();
  });

  it('does not render content for an active tab filtered out of the tab list', () => {
    mockActiveTabId = 'hidden-transcript-tab-id';

    render(<PageLayoutTabsRenderer />);

    expect(screen.queryByText(/Rendered tab:/)).not.toBeInTheDocument();
    expect(mockSetActiveTabId).toHaveBeenCalledWith('home-tab-id');
  });

  it('renders content when the active tab remains renderable', () => {
    mockActiveTabId = 'home-tab-id';

    render(<PageLayoutTabsRenderer />);

    expect(screen.getByText('Rendered tab: home-tab-id')).toBeVisible();
  });
});
