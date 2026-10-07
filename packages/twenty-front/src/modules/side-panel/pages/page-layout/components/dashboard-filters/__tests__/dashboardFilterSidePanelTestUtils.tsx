import { PAGE_LAYOUT_TEST_INSTANCE_ID } from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { pageLayoutPersistedComponentState } from '@/page-layout/states/pageLayoutPersistedComponentState';
import { makeTab } from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayout } from '@/page-layout/types/PageLayout';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildDefaultBarChartConfiguration } from '@/page-layout/utils/buildDefaultBarChartConfiguration';
import { buildDraftPageLayoutWidget } from '@/page-layout/utils/buildDraftPageLayoutWidget';
import { toDraftPageLayout } from '@/page-layout/utils/toDraftPageLayout';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { MemoryRouter } from 'react-router-dom';
import {
  type DashboardFilterBinding,
  type DashboardFilterSlot,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { ThemeProvider } from 'twenty-ui/theme';
import {
  PageLayoutTabLayoutMode,
  PageLayoutType,
  WidgetType,
} from '~/generated-metadata/graphql';
import { JestObjectMetadataItemSetter } from '~/testing/jest/JestObjectMetadataItemSetter';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

export const SIDE_PANEL_PAGE_TEST_INSTANCE_ID = 'side-panel-page-test';

export const companyObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('company');
export const personObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('person');

export const getFieldIdOrThrow = (
  objectMetadataItem: { fields: { id: string; name: string }[] },
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (field) => field.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Expected a ${fieldName} field`);
  }

  return field.id;
};

const GRID_POSITION = {
  layoutMode: PageLayoutTabLayoutMode.GRID,
  row: 0,
  column: 0,
  rowSpan: 2,
  columnSpan: 2,
};

export const buildChartWidget = ({
  id,
  title,
  objectMetadataId,
  dashboardFilterBindings,
}: {
  id: string;
  title: string;
  objectMetadataId: string;
  dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>;
}) =>
  buildDraftPageLayoutWidget({
    id,
    pageLayoutTabId: 'tab-1',
    title,
    type: WidgetType.GRAPH,
    configuration: {
      ...buildDefaultBarChartConfiguration({}),
      ...(isDefined(dashboardFilterBindings)
        ? { dashboardFilterBindings }
        : {}),
    },
    position: GRID_POSITION,
    objectMetadataId,
  });

export const getDraftAtom = () =>
  pageLayoutDraftComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

export const getPersistedAtom = () =>
  pageLayoutPersistedComponentState.atomFamily({
    instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
  });

export const getDraftWidgetBindings = (widgetId: string) => {
  const widget = jotaiStore
    .get(getDraftAtom())
    .tabs.flatMap((tab) => tab.widgets)
    .find((widget) => widget.id === widgetId);

  if (!isDefined(widget)) {
    throw new Error(`Expected widget ${widgetId} in the draft`);
  }

  return (
    widget.configuration as {
      dashboardFilterBindings?: Record<string, DashboardFilterBinding | null>;
    }
  ).dashboardFilterBindings;
};

export const setUpDashboardStore = ({
  widgets,
  dashboardFilters,
}: {
  widgets: PageLayoutWidget[];
  dashboardFilters: DashboardFilterSlot[] | null;
}) => {
  resetJotaiStore();

  const pageLayout = {
    id: PAGE_LAYOUT_TEST_INSTANCE_ID,
    name: 'Dashboard',
    type: PageLayoutType.DASHBOARD,
    objectMetadataId: null,
    dashboardFilters,
    tabs: [makeTab('tab-1', widgets, 0, PageLayoutTabLayoutMode.GRID)],
  } as PageLayout;

  jotaiStore.set(getPersistedAtom(), pageLayout);
  jotaiStore.set(getDraftAtom(), toDraftPageLayout(pageLayout));

  return pageLayout;
};

export const renderInSidePanel = async (children: ReactNode) => {
  render(
    <I18nProvider i18n={i18n}>
      <ThemeProvider colorScheme="light">
        <JotaiProvider store={jotaiStore}>
          <MemoryRouter>
            <JestObjectMetadataItemSetter>
              <SidePanelPageComponentInstanceContext.Provider
                value={{ instanceId: SIDE_PANEL_PAGE_TEST_INSTANCE_ID }}
              >
                {children}
                <div data-testid="metadata-loaded" />
              </SidePanelPageComponentInstanceContext.Provider>
            </JestObjectMetadataItemSetter>
          </MemoryRouter>
        </JotaiProvider>
      </ThemeProvider>
    </I18nProvider>,
  );

  await screen.findByTestId('metadata-loaded');
};
