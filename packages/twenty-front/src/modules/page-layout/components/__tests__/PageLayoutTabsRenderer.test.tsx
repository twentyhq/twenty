import { PageLayoutTabsRenderer } from '@/page-layout/components/PageLayoutTabsRenderer';
import { WorkspaceSurfaceContext } from '@/ui/layout/contexts/WorkspaceSurfaceContext';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';

let mockActiveTabId = 'hidden-transcript-tab-id';
let mockPrerenderedTabIds: string[] = [];
let mockTargetRecordId = 'calendar-event-id';
let mockIsInSidePanel = false;
const mockSetActiveTabId = jest.fn();
const mockSetPrerenderedTabIds = jest.fn();

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

const timelineTab = {
  ...homeTab,
  id: 'timeline-tab-id',
  title: 'Timeline',
  position: 1,
  icon: 'IconTimeline',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
};

const frontComponentTab = {
  ...homeTab,
  id: 'front-component-tab-id',
  title: 'App',
  position: 2,
  icon: 'IconApps',
  layoutMode: PageLayoutTabLayoutMode.VERTICAL_LIST,
  widgets: [{ id: 'front-component-widget', type: WidgetType.FRONT_COMPONENT }],
};

jest.mock('@/page-layout/components/dnd/PageLayoutWidgetDndProvider', () => ({
  PageLayoutWidgetDndProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/page-layout/components/PageLayoutLeftPanel', () => ({
  PageLayoutLeftPanel: () => null,
}));

jest.mock('@/page-layout/components/PageLayoutRecordIdentifierBar', () => ({
  PageLayoutRecordIdentifierBar: () => null,
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
    tabsToRenderInTabList: [homeTab, timelineTab, frontComponentTab],
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
    layoutType: PageLayoutType.RECORD_PAGE,
    targetRecordIdentifier: {
      id: mockTargetRecordId,
      targetObjectNameSingular: 'calendarEvent',
    },
  }),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue',
  () => ({
    useAtomComponentStateValue: (componentState: { key: string }) =>
      componentState.key === 'pageLayoutPrerenderedTabIdsComponentState'
        ? mockPrerenderedTabIds
        : mockActiveTabId,
  }),
);

jest.mock('@/ui/utilities/state/jotai/hooks/useSetAtomComponentState', () => ({
  useSetAtomComponentState: () => mockSetPrerenderedTabIds,
}));

jest.mock('@/ui/utilities/state/jotai/hooks/useAtomComponentState', () => ({
  useAtomComponentState: () => [mockActiveTabId, mockSetActiveTabId],
}));

jest.mock('@/ui/utilities/responsive/hooks/useIsMobile', () => ({
  useIsMobile: () => false,
}));

jest.mock('@/ui/utilities/scroll/components/ScrollWrapper', () => ({
  ScrollWrapper: ({
    children,
    componentInstanceId,
  }: {
    children: ReactNode;
    componentInstanceId: string;
  }) => (
    <div
      id={`scroll-wrapper-${componentInstanceId}`}
      data-testid="scroll-wrapper"
    >
      {children}
    </div>
  ),
}));

const TestWrapper = ({ children }: { children: ReactNode }) => (
  <MemoryRouter>
    <WorkspaceSurfaceContext.Provider
      value={{
        type: mockIsInSidePanel ? 'side-panel' : 'main',
        instanceId: mockIsInSidePanel ? 'side-panel' : 'main',
        ownsRouteLocation: !mockIsInSidePanel,
      }}
    >
      {children}
    </WorkspaceSurfaceContext.Provider>
  </MemoryRouter>
);

describe('PageLayoutTabsRenderer', () => {
  beforeEach(() => {
    mockPrerenderedTabIds = [];
    mockTargetRecordId = 'calendar-event-id';
    mockIsInSidePanel = false;
    mockSetActiveTabId.mockClear();
    mockSetPrerenderedTabIds.mockClear();
  });

  it('does not render content for an active tab filtered out of the tab list', () => {
    mockActiveTabId = 'hidden-transcript-tab-id';

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    expect(screen.queryByText(/Rendered tab:/)).not.toBeInTheDocument();
    expect(mockSetActiveTabId).toHaveBeenCalledWith('home-tab-id');
  });

  it('renders content when the active tab remains renderable', () => {
    mockActiveTabId = 'home-tab-id';

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    expect(screen.getByText('Rendered tab: home-tab-id')).toBeVisible();
  });

  it('mounts prerendered vertical-list tabs alongside the active tab', () => {
    mockActiveTabId = 'home-tab-id';
    mockPrerenderedTabIds = ['timeline-tab-id'];

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    expect(screen.getByText('Rendered tab: home-tab-id')).toBeInTheDocument();
    expect(
      screen.getByText('Rendered tab: timeline-tab-id'),
    ).toBeInTheDocument();
  });

  it('mounts prerendered application widget tabs offscreen alongside the active tab', () => {
    mockActiveTabId = 'timeline-tab-id';
    mockPrerenderedTabIds = ['front-component-tab-id'];

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    expect(
      screen.getByText('Rendered tab: timeline-tab-id'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Rendered tab: front-component-tab-id'),
    ).toBeInTheDocument();
  });

  it('does not mount prerendered tabs that are not prerenderable', () => {
    mockActiveTabId = 'timeline-tab-id';
    mockPrerenderedTabIds = ['home-tab-id'];

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    expect(
      screen.getByText('Rendered tab: timeline-tab-id'),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Rendered tab: home-tab-id'),
    ).not.toBeInTheDocument();
  });

  it('resets the scroll position when the target record changes', () => {
    mockActiveTabId = 'home-tab-id';

    const { rerender } = render(<PageLayoutTabsRenderer />, {
      wrapper: TestWrapper,
    });

    const scrollWrapper = screen.getByTestId('scroll-wrapper');

    scrollWrapper.scrollTop = 200;
    mockTargetRecordId = 'another-calendar-event-id';

    rerender(<PageLayoutTabsRenderer />);

    expect(scrollWrapper.scrollTop).toBe(0);
  });

  it('resets the scroll wrapper owned by the current rendering context', () => {
    mockActiveTabId = 'home-tab-id';

    render(<PageLayoutTabsRenderer />, { wrapper: TestWrapper });

    const mainViewScrollWrapper = screen.getByTestId('scroll-wrapper');
    mainViewScrollWrapper.scrollTop = 200;

    mockIsInSidePanel = true;

    const { rerender } = render(<PageLayoutTabsRenderer />, {
      wrapper: TestWrapper,
    });
    const sidePanelScrollWrapper = screen.getAllByTestId('scroll-wrapper')[1];

    expect(sidePanelScrollWrapper.id).not.toBe(mainViewScrollWrapper.id);

    sidePanelScrollWrapper.scrollTop = 200;
    mockActiveTabId = 'hidden-transcript-tab-id';

    rerender(<PageLayoutTabsRenderer />);

    expect(mainViewScrollWrapper.scrollTop).toBe(200);
    expect(sidePanelScrollWrapper.scrollTop).toBe(0);
  });
});
