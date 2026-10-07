import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { isDashboardInEditModeComponentState } from '@/page-layout/states/isDashboardInEditModeComponentState';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { type DashboardFilterSlot, SidePanelPages } from 'twenty-shared/types';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockNavigatePageLayoutSidePanel = jest.fn();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: buildDefaultBarChartConfiguration({}),
  position: {
    layoutMode: PageLayoutTabLayoutMode.GRID,
    row: 0,
    column: 0,
    rowSpan: 2,
    columnSpan: 2,
  },
  objectMetadataId: companyObjectMetadataItem.id,
});

const renderDashboardFilterBar = async ({
  pageLayoutType,
  isDashboardFiltersEnabled = true,
  isInEditMode = false,
  dashboardFilters = null,
}: {
  pageLayoutType: PageLayoutType;
  isDashboardFiltersEnabled?: boolean;
  isInEditMode?: boolean;
  dashboardFilters?: DashboardFilterSlot[] | null;
}) => {
  resetJotaiStore();

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED,
        value: isDashboardFiltersEnabled,
      },
    ],
  });

  const pageLayout = {
    id: PAGE_LAYOUT_TEST_INSTANCE_ID,
    name: 'Dashboard',
    type: pageLayoutType,
    objectMetadataId: null,
    dashboardFilters,
    tabs: [
      makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
    ],
  } as PageLayout;

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    pageLayout,
  );

  // Edit mode reads the draft, like the real dashboard once editing starts.
  jotaiStore.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    toDraftPageLayout(pageLayout),
  );

  jotaiStore.set(
    isDashboardInEditModeComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    isInEditMode,
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter>
            <JestObjectMetadataItemSetter>
              <PageLayoutTestWrapper
                store={jotaiStore}
                layoutType={pageLayoutType}
              >
                <DashboardFilterBar />
                <div data-testid="metadata-loaded" />
              </PageLayoutTestWrapper>
            </JestObjectMetadataItemSetter>
          </MemoryRouter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

describe('DashboardFilterBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders Date and Owner chips on a dashboard when the feature flag is on', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
    });

    expect(screen.getByText('Date')).toBeVisible();
    expect(screen.getByText('Owner')).toBeVisible();
  });

  it('renders nothing when the feature flag is off', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
      isDashboardFiltersEnabled: false,
    });

    expect(screen.queryByText('Date')).not.toBeInTheDocument();
    expect(screen.queryByText('Owner')).not.toBeInTheDocument();
  });

  it('renders nothing when the layout is not a dashboard', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.RECORD_PAGE,
    });

    expect(screen.queryByText('Date')).not.toBeInTheDocument();
    expect(screen.queryByText('Owner')).not.toBeInTheDocument();
  });

  it('shows the Add filter button only in edit mode', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
    });

    expect(
      screen.queryByRole('button', { name: 'Add filter' }),
    ).not.toBeInTheDocument();
  });

  it('opens the dashboard filters side panel page from the Add filter button in edit mode', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
      isInEditMode: true,
    });

    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Add filter' }));

    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith({
      sidePanelPage: SidePanelPages.PageLayoutDashboardFilters,
      resetNavigationStack: true,
    });
  });

  it('renders the bar with the Add filter button in edit mode even without slots', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
      isInEditMode: true,
      dashboardFilters: [],
    });

    expect(screen.getByRole('button', { name: 'Add filter' })).toBeVisible();
    expect(screen.queryByText('Date')).not.toBeInTheDocument();
  });

  it('renders nothing outside edit mode when the dashboard has no slots', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
      dashboardFilters: [],
    });

    expect(
      screen.queryByRole('button', { name: 'Add filter' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('Date')).not.toBeInTheDocument();
  });

  it('does not show the Add filter button when the feature flag is off even in edit mode', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
      isInEditMode: true,
      isDashboardFiltersEnabled: false,
    });

    expect(
      screen.queryByRole('button', { name: 'Add filter' }),
    ).not.toBeInTheDocument();
  });
});
