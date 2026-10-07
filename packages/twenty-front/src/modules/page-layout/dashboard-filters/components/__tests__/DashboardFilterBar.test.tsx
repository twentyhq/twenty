import { DashboardFilterBar } from '@/page-layout/dashboard-filters/components/DashboardFilterBar';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const mockIsFeatureEnabled = jest.fn();

jest.mock('@/workspace/hooks/useIsFeatureEnabled', () => ({
  useIsFeatureEnabled: () => mockIsFeatureEnabled(),
}));

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
}: {
  pageLayoutType: PageLayoutType;
}) => {
  resetJotaiStore();

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: pageLayoutType,
      objectMetadataId: null,
      tabs: [
        makeTab('tab-1', [companyChartWidget], 0, PageLayoutTabLayoutMode.GRID),
      ],
    } as PageLayout,
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
    mockIsFeatureEnabled.mockReturnValue(true);
  });

  it('renders Date and Owner chips on a dashboard when the feature flag is on', async () => {
    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
    });

    expect(screen.getByText('Date')).toBeVisible();
    expect(screen.getByText('Owner')).toBeVisible();
  });

  it('renders nothing when the feature flag is off', async () => {
    mockIsFeatureEnabled.mockReturnValue(false);

    await renderDashboardFilterBar({
      pageLayoutType: PageLayoutType.DASHBOARD,
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
});
