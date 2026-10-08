import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { SidePanelRouter } from '@/side-panel/components/SidePanelRouter';
import { usePageLayoutIdFromContextStore } from '@/side-panel/pages/page-layout/hooks/usePageLayoutIdFromContextStore';
import { isSidePanelOpenedState } from '@/side-panel/states/isSidePanelOpenedState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { sidePanelSubPageStackComponentState } from '@/side-panel/states/sidePanelSubPageStackComponentState';
import { SidePanelSubPages } from '@/side-panel/types/SidePanelSubPages';
import { SidePanelPages } from 'twenty-shared/types';
import { IconChartPie } from 'twenty-ui/icon';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

// Stands in for the page layout side panel pages, which all read their target
// through usePageLayoutIdFromContextStore. A function declaration so the
// hoisted jest.mock factories can use it.
function MockPageLayoutProbe({ label }: { label: string }) {
  const { pageLayoutId } = usePageLayoutIdFromContextStore();

  return (
    <div>
      {label} of {pageLayoutId}
    </div>
  );
}

jest.mock('@/side-panel/constants/SidePanelPagesConfig', () => ({
  SIDE_PANEL_PAGES_CONFIG: new Map([
    [
      'dashboard-chart-settings',
      <MockPageLayoutProbe label="Chart settings" />,
    ],
  ]),
}));

jest.mock('@/side-panel/constants/SidePanelSubPagesConfig', () => ({
  SIDE_PANEL_SUB_PAGES_CONFIG: new Map([
    ['page-layout-graph-filter', <MockPageLayoutProbe label="Chart filters" />],
  ]),
}));

jest.mock('@/side-panel/components/SidePanelPageLayoutInfoContent', () => ({
  SidePanelPageLayoutInfoContent: ({
    pageLayoutId,
  }: {
    pageLayoutId: string;
  }) => <div>Widget title of {pageLayoutId}</div>,
}));

jest.mock('@/command-menu-item/contexts/CommandMenuContextProvider', () => ({
  CommandMenuContextProvider: ({ children }: { children: ReactNode }) => (
    <>{children}</>
  ),
}));

jest.mock('@/side-panel/components/SidePanelTopBarInputFocusEffect', () => ({
  SidePanelTopBarInputFocusEffect: () => null,
}));

jest.mock('@/side-panel/components/SidePanelTopBarRightCornerIcon', () => ({
  SidePanelTopBarRightCornerIcon: () => null,
}));

jest.mock('@/side-panel/components/SidePanelExpandButton', () => ({
  SidePanelExpandButton: () => null,
}));

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({ closeSidePanelMenu: jest.fn() }),
}));

const DASHBOARD_RECORD_ID = 'dashboard-record-id';
const DASHBOARD_PAGE_LAYOUT_ID = 'dashboard-page-layout-id';
const CHART_SETTINGS_PAGE_ID = 'chart-settings-page-id';

const dashboardObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('dashboard');
const companyObjectMetadataItem = getMockObjectMetadataItemOrThrow('company');

const createDashboardChartSettingsStore = () => {
  const store = createStore();

  setTestObjectMetadataItemsInMetadataStore(store, [
    dashboardObjectMetadataItem,
    companyObjectMetadataItem,
  ]);
  store.set(
    contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    dashboardObjectMetadataItem.id,
  );
  store.set(
    contextStoreTargetedRecordsRuleComponentState.atomFamily({
      instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    { mode: 'selection', selectedRecordIds: [DASHBOARD_RECORD_ID] },
  );
  store.set(recordStoreFamilyState.atomFamily(DASHBOARD_RECORD_ID), {
    id: DASHBOARD_RECORD_ID,
    __typename: 'Dashboard',
    pageLayoutId: DASHBOARD_PAGE_LAYOUT_ID,
  });
  store.set(isSidePanelOpenedState.atom, true);
  store.set(sidePanelNavigationStackState.atom, [
    {
      page: SidePanelPages.DashboardChartSettings,
      pageTitle: 'Chart',
      pageIcon: IconChartPie,
      pageId: CHART_SETTINGS_PAGE_ID,
    },
  ]);

  return store;
};

// Leaving the dashboard resets the main context store while the side panel
// is still mounted for its close animation, with its navigation stack intact
const leaveDashboardForCompanies = (store: ReturnType<typeof createStore>) => {
  act(() => {
    store.set(isSidePanelOpenedState.atom, false);
    store.set(
      contextStoreTargetedRecordsRuleComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      { mode: 'selection', selectedRecordIds: [] },
    );
    store.set(
      contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
        instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
      }),
      companyObjectMetadataItem.id,
    );
  });
};

const renderSidePanelRouter = (store: ReturnType<typeof createStore>) =>
  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={store}>
        <SidePanelRouter />
      </JotaiProvider>
    </I18nProvider>,
  );

describe('SidePanelRouter', () => {
  it('keeps the dashboard chart settings page usable while its dashboard is open', () => {
    renderSidePanelRouter(createDashboardChartSettingsStore());

    expect(
      screen.getByText(`Widget title of ${DASHBOARD_PAGE_LAYOUT_ID}`),
    ).toBeInTheDocument();
    expect(
      screen.getByText(`Chart settings of ${DASHBOARD_PAGE_LAYOUT_ID}`),
    ).toBeInTheDocument();
  });

  it('does not crash when leaving the dashboard with the chart settings open', () => {
    const store = createDashboardChartSettingsStore();

    renderSidePanelRouter(store);

    leaveDashboardForCompanies(store);

    expect(screen.getByText('Chart')).toBeInTheDocument();
    expect(screen.queryByText(/Widget title of/)).not.toBeInTheDocument();
    expect(screen.queryByText(/Chart settings of/)).not.toBeInTheDocument();
  });

  it('does not crash when leaving the dashboard with a chart settings sub page open', () => {
    const store = createDashboardChartSettingsStore();

    store.set(
      sidePanelSubPageStackComponentState.atomFamily({
        instanceId: CHART_SETTINGS_PAGE_ID,
      }),
      [
        {
          id: 'chart-filter-sub-page',
          subPage: SidePanelSubPages.PageLayoutGraphFilter,
          title: 'Filter',
        },
      ],
    );

    renderSidePanelRouter(store);

    expect(
      screen.getByText(`Chart filters of ${DASHBOARD_PAGE_LAYOUT_ID}`),
    ).toBeInTheDocument();

    leaveDashboardForCompanies(store);

    expect(screen.queryByText(/Chart filters of/)).not.toBeInTheDocument();
  });
});
