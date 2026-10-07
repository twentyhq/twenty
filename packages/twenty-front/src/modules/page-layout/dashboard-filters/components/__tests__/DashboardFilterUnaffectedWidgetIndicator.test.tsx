import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { DashboardFilterUnaffectedWidgetIndicator } from '@/page-layout/dashboard-filters/components/DashboardFilterUnaffectedWidgetIndicator';
import { BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInDateDashboardFilterSlotId';
import { BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID } from '@/page-layout/dashboard-filters/constants/BuiltInOwnerDashboardFilterSlotId';
import { dashboardFilterValuesComponentState } from '@/page-layout/dashboard-filters/states/dashboardFilterValuesComponentState';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
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
import {
  type DashboardFilterValue,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  FeatureFlagKey,
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetConfigurationType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const INDICATOR_LABEL = 'Not affected by dashboard filters';

const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');
const noteObjectMetadataItem = getMockObjectMetadataItemOrThrow('note');

const GRID_POSITION = {
  layoutMode: PageLayoutTabLayoutMode.GRID,
  row: 0,
  column: 0,
  rowSpan: 2,
  columnSpan: 2,
};

const companyChartWidget = buildDraftPageLayoutWidget({
  id: 'company-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Companies',
  type: WidgetType.GRAPH,
  configuration: buildDefaultBarChartConfiguration({}),
  position: GRID_POSITION,
  objectMetadataId: companyObjectMetadataItem.id,
});

// Notes have createdAt but no workspace member relation, so only the owner slot leaves them out.
const noteChartWidget = buildDraftPageLayoutWidget({
  id: 'note-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Notes',
  type: WidgetType.GRAPH,
  configuration: buildDefaultBarChartConfiguration({}),
  position: GRID_POSITION,
  objectMetadataId: noteObjectMetadataItem.id,
});

const iframeWidget = buildDraftPageLayoutWidget({
  id: 'iframe-widget',
  pageLayoutTabId: 'tab-1',
  title: 'Iframe',
  type: WidgetType.IFRAME,
  configuration: {
    configurationType: WidgetConfigurationType.IFRAME,
    url: 'https://example.com',
  },
  position: GRID_POSITION,
  objectMetadataId: null,
});

const DATE_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS_AFTER,
  value: '2026-01-01T00:00:00.000Z',
};

const OWNER_ME_VALUE: DashboardFilterValue = {
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentWorkspaceMemberSelected: true,
    selectedRecordIds: [],
  }),
};

const renderIndicator = async ({
  widget,
  dashboardFilterValues,
}: {
  widget: PageLayoutWidget;
  dashboardFilterValues: Record<string, DashboardFilterValue | undefined>;
}) => {
  resetJotaiStore();

  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      { key: FeatureFlagKey.IS_DASHBOARD_FILTERS_ENABLED, value: true },
    ],
  });

  jotaiStore.set(
    pageLayoutPersistedComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    {
      id: PAGE_LAYOUT_TEST_INSTANCE_ID,
      name: 'Dashboard',
      type: PageLayoutType.DASHBOARD,
      objectMetadataId: null,
      tabs: [
        makeTab(
          'tab-1',
          [companyChartWidget, noteChartWidget, iframeWidget],
          0,
          PageLayoutTabLayoutMode.GRID,
        ),
      ],
    } as PageLayout,
  );

  jotaiStore.set(
    dashboardFilterValuesComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    dashboardFilterValues,
  );

  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <JestObjectMetadataItemSetter>
            <PageLayoutTestWrapper
              store={jotaiStore}
              layoutType={PageLayoutType.DASHBOARD}
            >
              <DashboardFilterUnaffectedWidgetIndicator widget={widget} />
              <div data-testid="metadata-loaded" />
            </PageLayoutTestWrapper>
          </JestObjectMetadataItemSetter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};

describe('DashboardFilterUnaffectedWidgetIndicator', () => {
  it('shows the indicator on a chart the valued slot does not reach', async () => {
    await renderIndicator({
      widget: noteChartWidget,
      dashboardFilterValues: {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: OWNER_ME_VALUE,
      },
    });

    expect(
      screen.getByRole('img', { name: INDICATOR_LABEL }),
    ).toBeInTheDocument();
  });

  it('shows nothing on a chart bound to the valued slot', async () => {
    await renderIndicator({
      widget: companyChartWidget,
      dashboardFilterValues: {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: OWNER_ME_VALUE,
      },
    });

    expect(
      screen.queryByRole('img', { name: INDICATOR_LABEL }),
    ).not.toBeInTheDocument();
  });

  it('shows nothing on a chart bound to one of two valued slots', async () => {
    await renderIndicator({
      widget: noteChartWidget,
      dashboardFilterValues: {
        [BUILT_IN_DATE_DASHBOARD_FILTER_SLOT_ID]: DATE_VALUE,
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: OWNER_ME_VALUE,
      },
    });

    expect(
      screen.queryByRole('img', { name: INDICATOR_LABEL }),
    ).not.toBeInTheDocument();
  });

  it('shows nothing when no slot has a value', async () => {
    await renderIndicator({
      widget: noteChartWidget,
      dashboardFilterValues: {},
    });

    expect(
      screen.queryByRole('img', { name: INDICATOR_LABEL }),
    ).not.toBeInTheDocument();
  });

  it('never shows on an iframe widget', async () => {
    await renderIndicator({
      widget: iframeWidget,
      dashboardFilterValues: {
        [BUILT_IN_OWNER_DASHBOARD_FILTER_SLOT_ID]: OWNER_ME_VALUE,
      },
    });

    expect(
      screen.queryByRole('img', { name: INDICATOR_LABEL }),
    ).not.toBeInTheDocument();
  });
});
